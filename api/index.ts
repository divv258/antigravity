import { handle } from 'hono/vercel';
import app from '../backend/src/index.js'; // Use .js extension for ESM imports

export const config = {
    runtime: 'nodejs',
};

export default handle(app);
