import { validateOutgoingUrl } from '../security/index';

/**
 * Ollama AI Service (Local 127.0.0.1:11434 & Public Cloudflare Tunnel https://*.trycloudflare.com)
 * Provides private on-premise inference or secure public access via Cloudflare tunnels.
 */

export interface OllamaModelTag {
  name: string;
  model: string;
  modified_at?: string;
  size?: number;
  digest?: string;
  details?: {
    format?: string;
    family?: string;
    families?: string[];
    parameter_size?: string;
    quantization_level?: string;
  };
}

export interface OllamaChatResponse {
  success: boolean;
  response?: string;
  model?: string;
  durationMs?: number;
  error?: string;
  totalDuration?: number;
  loadDuration?: number;
}

export class OllamaService {
  public static readonly DEFAULT_BASE_URL = 'http://127.0.0.1:11434';
  public static readonly DEFAULT_API_KEY = 'ZAIN_SECRET_2026';

  /**
   * Get the configured Ollama base URL, supporting both:
   * 1. Local internal: http://127.0.0.1:11434
   * 2. Public / External Cloudflare Tunnel: https://xxxx.trycloudflare.com
   */
  public static getBaseUrl(customUrl?: string): string {
    const raw = customUrl || process.env.OLLAMA_BASE_URL || this.DEFAULT_BASE_URL;
    return raw.trim().replace(/\/+$/, '');
  }

  /**
   * Builds standardized headers for Ollama requests:
   * - Content-Type: application/json
   * - x-api-key: ZAIN_SECRET_2026 (or custom key)
   * - Authorization: Bearer <key>
   */
  public static getHeaders(customApiKey?: string): Record<string, string> {
    const key = customApiKey || process.env.API_KEY || this.DEFAULT_API_KEY;
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-api-key': key,
      'Authorization': `Bearer ${key}`
    };
  }

  /**
   * Ping / Check connection to the local Ollama daemon or Cloudflare Tunnel
   */
  public static async checkConnection(customUrl?: string, customApiKey?: string): Promise<{
    connected: boolean;
    baseUrl: string;
    isTunnel: boolean;
    models: string[];
    latencyMs: number;
    error?: string;
  }> {
    const baseUrl = this.getBaseUrl(customUrl);
    const isTunnel = baseUrl.includes('.trycloudflare.com') || baseUrl.startsWith('https://');
    const startTime = Date.now();

    // Validate outgoing URL
    const urlValidation = validateOutgoingUrl(baseUrl);
    if (!urlValidation.valid) {
      return {
        connected: false,
        baseUrl,
        isTunnel,
        models: [],
        latencyMs: 0,
        error: urlValidation.reason || 'الرابط غير مسموح به أمنياً'
      };
    }

    try {
      const res = await fetch(`${baseUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(isTunnel ? 6000 : 3000),
        headers: this.getHeaders(customApiKey)
      });

      const latencyMs = Date.now() - startTime;

      if (res.ok) {
        const data = await res.json();
        const models = Array.isArray(data.models)
          ? data.models.map((m: OllamaModelTag) => m.name || m.model)
          : [];

        return {
          connected: true,
          baseUrl,
          isTunnel,
          models,
          latencyMs
        };
      } else {
        return {
          connected: false,
          baseUrl,
          isTunnel,
          models: [],
          latencyMs,
          error: `HTTP ${res.status}: ${res.statusText}${isTunnel ? ' (تحقق من نفق Cloudflare ومفتاح المصادقة x-api-key)' : ''}`
        };
      }
    } catch (err: any) {
      const isTimeout = err.name === 'TimeoutError';
      return {
        connected: false,
        baseUrl,
        isTunnel,
        models: [],
        latencyMs: Date.now() - startTime,
        error: isTunnel
          ? (isTimeout ? 'انتهت مهلة الاتصال بنفق Cloudflare (Timeout)' : `تعذر الاتصال بنفق Cloudflare على (${baseUrl}). تأكد من تشغيل cloudflared وصحة الرابط.`)
          : (isTimeout ? 'انتهت مهلة الاتصال بخادم Ollama المحلي (Timeout 3000ms)' : `تعذر الاتصال بخادم Ollama الداخلي على (${baseUrl}). تأكد من تشغيل أمر ollama serve محلياً.`)
      };
    }
  }

  /**
   * Chat completion via local Ollama or Public Cloudflare Tunnel
   */
  public static async chat(params: {
    prompt: string;
    model?: string;
    systemPrompt?: string;
    baseUrl?: string;
    apiKey?: string;
    temperature?: number;
  }): Promise<OllamaChatResponse> {
    const baseUrl = this.getBaseUrl(params.baseUrl);
    const isTunnel = baseUrl.includes('.trycloudflare.com') || baseUrl.startsWith('https://');
    const selectedModel = params.model || process.env.OLLAMA_MODEL || 'llama3:latest';
    const startTime = Date.now();

    // Outgoing URL validation
    const urlValidation = validateOutgoingUrl(baseUrl);
    if (!urlValidation.valid) {
      return {
        success: false,
        error: urlValidation.reason || 'الرابط غير مسموح به أمنياً',
        model: selectedModel,
        durationMs: 0
      };
    }

    try {
      const messages: Array<{ role: string; content: string }> = [];
      if (params.systemPrompt) {
        messages.push({ role: 'system', content: params.systemPrompt });
      }
      messages.push({ role: 'user', content: params.prompt });

      const res = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        signal: AbortSignal.timeout(isTunnel ? 45000 : 30000),
        headers: this.getHeaders(params.apiKey),
        body: JSON.stringify({
          model: selectedModel,
          messages,
          stream: false,
          options: {
            temperature: params.temperature ?? 0.7
          }
        })
      });

      const durationMs = Date.now() - startTime;

      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        return {
          success: false,
          error: `Ollama API error (${res.status}): ${errBody || res.statusText}`,
          model: selectedModel,
          durationMs
        };
      }

      const data = await res.json();
      const responseText = data.message?.content || data.response || '';

      return {
        success: true,
        response: responseText,
        model: data.model || selectedModel,
        durationMs,
        totalDuration: data.total_duration,
        loadDuration: data.load_duration
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.name === 'TimeoutError'
          ? 'استغرق نموذج Ollama وقتاً أطول من المسموح به (Timeout).'
          : `خطأ في الاتصال بالنموذج (${baseUrl}): ${err.message}`,
        model: selectedModel,
        durationMs: Date.now() - startTime
      };
    }
  }

  /**
   * List installed models on local Ollama or Cloudflare Tunnel
   */
  public static async listModels(customUrl?: string, apiKey?: string): Promise<string[]> {
    try {
      const status = await this.checkConnection(customUrl, apiKey);
      return status.models;
    } catch {
      return [];
    }
  }
}
