import { handle } from 'hono/vercel';
import app from '../backend/src/index'; // Extensionless for better compatibility

export const config = {
    runtime: 'nodejs',
};

export default handle(app);
