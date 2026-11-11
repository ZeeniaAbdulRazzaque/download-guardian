// Vercel Serverless Function entry point
// Wraps the Express app as a serverless handler
import { createApp } from '../src/app.js';

const app = createApp();

export default app;

