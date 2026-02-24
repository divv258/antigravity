import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { generateRoute } from './routes/generate.js';

const app = new Hono();

app.use(
    '/*',
    cors({
        origin: (origin) => {
            // Allow localhost and any vercel.app subdomain
            if (!origin || origin.includes('localhost') || origin.endsWith('.vercel.app')) {
                return origin;
            }
            return null;
        },
        allowMethods: ['GET', 'POST', 'OPTIONS'],
        allowHeaders: ['Content-Type'],
    })
);

app.onError((err, c) => {
    console.error('Global Error Handler:', err);
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return c.json({ error: message }, 500);
});

app.route('/api', generateRoute);

app.get('/health', (c) => c.json({ status: 'ok', time: new Date().toISOString() }));

const port = Number(process.env.PORT ?? 3001);

if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
    console.log(`🚀 QuizSnap backend running on http://localhost:${port}`);
    serve({ fetch: app.fetch, port });
}

export default app;
