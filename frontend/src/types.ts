export interface MCQItem {
    question: string;
    options: string[];
    answer: string; // "A" | "B" | "C" | "D"
}

export interface FlashcardItem {
    front: string;
    back: string;
}

export interface GenerateResponse {
    mode: 'mcq' | 'flashcard';
    data: MCQItem[] | FlashcardItem[];
    extractedTextLength?: number;
}
