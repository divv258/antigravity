import { Hono } from 'hono';
import Groq from 'groq-sdk';

export const generateRoute = new Hono();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// llama-3.2-11b-vision-preview was decommissioned April 14 2025
// Official replacement: meta-llama/llama-4-scout-17b-16e-instruct
const VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
const LOGIC_MODEL = 'llama-3.3-70b-versatile';

interface GenerateRequest {
    image: string;       // base64-encoded image
    mimeType: string;    // e.g. "image/jpeg"
    mode: 'mcq' | 'flashcard';
}

interface MCQItem {
    question: string;
    options: string[];
    answer: string;
}

interface FlashcardItem {
    front: string;
    back: string;
}

const MCQ_SYSTEM_PROMPT = `You are an expert educator. Given the text content of a textbook page, generate up to 15 multiple-choice questions.
Return ONLY a valid JSON object with a "questions" key containing an array. No extra text, markdown, or code fences.
Example:
{
  "questions": [
    {"question":"string","options":["A. text","B. text","C. text","D. text"],"answer":"A"}
  ]
}
The "answer" field must be exactly one of: "A", "B", "C", or "D", matching the correct option.`;

const FLASHCARD_SYSTEM_PROMPT = `You are an expert educator. Given the text content of a textbook page, generate concise flashcards for key concepts, terms, and facts.
Return ONLY a valid JSON array with no extra text, markdown, or code fences. Each element must follow this exact schema:
{"front":"Question or Term","back":"Answer or Definition"}
Generate between 8 and 20 flashcards.`;

generateRoute.post('/generate', async (c) => {
    try {
        const body = await c.req.json<GenerateRequest>();
        const { image, mimeType, mode } = body;

        if (!image || !mimeType || !mode) {
            return c.json({ error: 'Missing required fields: image, mimeType, mode' }, 400);
        }
        if (mode !== 'mcq' && mode !== 'flashcard') {
            return c.json({ error: 'mode must be "mcq" or "flashcard"' }, 400);
        }

        // Step 1: Vision model extracts text from image
        const visionResponse = await groq.chat.completions.create({
            model: VISION_MODEL,
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:${mimeType};base64,${image}`,
                            },
                        },
                        {
                            type: 'text',
                            text: 'Please extract and transcribe ALL readable text from this textbook page. Include headings, body text, lists, and any visible content. Return the raw text only.',
                        },
                    ],
                },
            ],
            max_tokens: 4096,
        });

        const extractedText = visionResponse.choices[0]?.message?.content ?? '';

        if (!extractedText.trim()) {
            return c.json({ error: 'Could not extract text from image. Please use a clearer photo.' }, 422);
        }

        // Step 2: Logic model generates structured quiz data
        const systemPrompt = mode === 'mcq' ? MCQ_SYSTEM_PROMPT : FLASHCARD_SYSTEM_PROMPT;

        const logicResponse = await groq.chat.completions.create({
            model: LOGIC_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                {
                    role: 'user',
                    content: `Here is the textbook content:\n\n${extractedText}\n\nGenerate the ${mode === 'mcq' ? 'MCQ questions' : 'flashcards'} now.`,
                },
            ],
            max_tokens: 4096,
            temperature: 0.4,
            response_format: { type: 'json_object' },
        });

        const rawJson = logicResponse.choices[0]?.message?.content ?? '[]';

        let data: MCQItem[] | FlashcardItem[];
        try {
            // The model returns a JSON object wrapping an array — handle both cases
            const parsed = JSON.parse(rawJson);
            data = Array.isArray(parsed) ? parsed : (parsed.questions ?? parsed.flashcards ?? parsed.data ?? Object.values(parsed)[0]);
        } catch {
            return c.json({ error: 'AI returned malformed JSON. Please try again.' }, 500);
        }

        return c.json({ mode, data, extractedTextLength: extractedText.length });
    } catch (err: unknown) {
        console.error('[/api/generate] Error:', err);
        const message = err instanceof Error ? err.message : 'Unknown error';
        return c.json({ error: message }, 500);
    }
});
