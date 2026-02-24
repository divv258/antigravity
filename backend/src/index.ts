import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { generateRoute } from './routes/generate.js';

const app = new Hono();

app.use(
    '/*',
    cors({
        origin: ['http://localhost:5173', 'http://localhost:4173'],
        allowMethods: ['GET', 'POST', 'OPTIONS'],
        allowHeaders: ['Content-Type'],
    })
);

app.route('/api', generateRoute);

app.get('/health', (c) => c.json({ status: 'ok', time: new Date().toISOString() }));

const port = Number(process.env.PORT ?? 3001);

if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
    console.log(`🚀 QuizSnap backend running on http://localhost:${port}`);
    serve({ fetch: app.fetch, port });
}

export default app;
