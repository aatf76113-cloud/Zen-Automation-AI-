/**
 * Server-side AI Router
 * Proxies all AI queries through GeminiService & fallback NLP engine.
 * No Gemini API keys are ever sent or exposed to browser.
 */
import { Router, Request, Response } from 'express';
import { GeminiService } from '../services/geminiService';
import { buildErrorResponse } from '../security/index';

export const aiRouter = Router();

/**
 * POST /api/ai/analyze
 * Analyzes inbound user text for sentiment, classification, intent score, and suggested action.
 */
aiRouter.post('/analyze', async (req: Request, res: Response) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string' || !text.trim()) {
    return buildErrorResponse(res, 400, 'INVALID_INPUT', 'نص الرسالة مطلوب لإجراء التحليل الذكي');
  }

  try {
    const analysis = await GeminiService.analyze(text);
    return res.json({
      success: true,
      analysis
    });
  } catch {
    return buildErrorResponse(res, 500, 'AI_ANALYSIS_FAILED', 'تعذرت معالجة التحليل الذكي');
  }
});
