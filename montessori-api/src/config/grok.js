import OpenAI from 'openai';
import { env } from './env.js';

/**
 * xAI Grok client — OpenAI-compatible SDK pointed at api.x.ai
 * The API key NEVER leaves this server module.
 */
export const grokClient = new OpenAI({
  apiKey: env.GROK_API_KEY,
  baseURL: 'https://api.x.ai/v1',
});

export const GROK_MODEL = env.GROK_MODEL;
