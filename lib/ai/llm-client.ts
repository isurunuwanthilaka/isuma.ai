import OpenAI from 'openai';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
}

/**
 * LLM Client that supports both OpenAI and Ollama
 * Configure via environment variables:
 * - LLM_PROVIDER: 'openai' or 'ollama' (default: 'openai')
 * - OPENAI_API_KEY: Your OpenAI API key (for OpenAI)
 * - OLLAMA_BASE_URL: Ollama server URL (default: 'http://localhost:11434')
 * - OLLAMA_MODEL: Ollama model name (default: 'llama3.2')
 */
class LLMClient {
  private provider: string;
  private openai?: OpenAI;
  private ollamaBaseUrl: string;
  private ollamaModel: string;

  constructor() {
    this.provider = process.env.LLM_PROVIDER || 'openai';
    this.ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.ollamaModel = process.env.OLLAMA_MODEL || 'llama3.2';

    if (this.provider === 'openai') {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  async chat(
    messages: LLMMessage[],
    options?: {
      temperature?: number;
      jsonMode?: boolean;
      model?: string;
    }
  ): Promise<LLMResponse> {
    if (this.provider === 'ollama') {
      return this.chatWithOllama(messages, options);
    } else {
      return this.chatWithOpenAI(messages, options);
    }
  }

  private async chatWithOpenAI(
    messages: LLMMessage[],
    options?: {
      temperature?: number;
      jsonMode?: boolean;
      model?: string;
    }
  ): Promise<LLMResponse> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

    const response = await this.openai.chat.completions.create({
      model: options?.model || 'gpt-4o-mini',
      messages: messages,
      temperature: options?.temperature ?? 0.3,
      ...(options?.jsonMode && { response_format: { type: 'json_object' } }),
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    return { content };
  }

  private async chatWithOllama(
    messages: LLMMessage[],
    options?: {
      temperature?: number;
      jsonMode?: boolean;
      model?: string;
    }
  ): Promise<LLMResponse> {
    const model = options?.model || this.ollamaModel;
    
    const response = await fetch(`${this.ollamaBaseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        options: {
          temperature: options?.temperature ?? 0.3,
        },
        ...(options?.jsonMode && { format: 'json' }),
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return { content: data.message.content };
  }

  async analyzeImage(
    imageUrl: string,
    prompt: string,
    options?: {
      model?: string;
    }
  ): Promise<LLMResponse> {
    if (this.provider === 'ollama') {
      return this.analyzeImageWithOllama(imageUrl, prompt, options);
    } else {
      return this.analyzeImageWithOpenAI(imageUrl, prompt, options);
    }
  }

  private async analyzeImageWithOpenAI(
    imageUrl: string,
    prompt: string,
    options?: {
      model?: string;
    }
  ): Promise<LLMResponse> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

    const response = await this.openai.chat.completions.create({
      model: options?.model || 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    return { content };
  }

  private async analyzeImageWithOllama(
    imageUrl: string,
    prompt: string,
    options?: {
      model?: string;
    }
  ): Promise<LLMResponse> {
    // Fetch image and convert to base64
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');

    const model = options?.model || 'llava'; // Ollama's vision model

    const response = await fetch(`${this.ollamaBaseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt,
        images: [base64Image],
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return { content: data.response };
  }
}

// Export singleton instance
export const llmClient = new LLMClient();
