// Vercel serverless entry point. An Express app is itself a valid
// (req, res) request handler, so it can be exported directly — Vercel's
// Node.js runtime invokes it exactly like any other function.
import { createApp } from '../src/app.js';

const app = createApp();

export default app;
