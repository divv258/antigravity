import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
}

export default function SEO({
    title = 'QuizSnap.ai — Turn Any Page Into a Quiz',
    description = 'Upload a photo of any textbook page and instantly generate interactive MCQ quizzes and flashcards powered by Groq AI.',
}: SEOProps) {
    return (
        <Helmet>
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content="website" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
        </Helmet>
    );
}
