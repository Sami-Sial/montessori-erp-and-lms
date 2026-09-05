import OpenAI from 'openai';
import { env } from './env.js';

/**
 * xAI Grok / Groq client — OpenAI-compatible SDK
 * Automatically detects Groq keys (gsk_) to route to the correct API.
 */
const isGroq = env.GROK_API_KEY?.startsWith('gsk_');

export const grokClient = new OpenAI({
  apiKey: env.GROK_API_KEY,
  baseURL: isGroq ? 'https://api.groq.com/openai/v1' : 'https://api.x.ai/v1',
});

export const GROK_MODEL = isGroq && env.GROK_MODEL.startsWith('grok') 
  ? 'qwen/qwen3.8-27b' 
  : env.GROK_MODEL;
