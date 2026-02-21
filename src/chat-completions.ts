import type {
  ArkChatCompletionRequest,
  ArkChatCompletionResponse,
  ArkChatCompletionStreamResponse,
} from '@/types/chat-openapi';

export class ArkChatCompletions {
  private baseUrl = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
  private apiKey: string;

  constructor(input: { baseUrl?: string; apiKey: string }) {
    if (!input.apiKey) {
      throw new Error('apiKey is required');
    }

    this.baseUrl = input.baseUrl || this.baseUrl;
    this.apiKey = input.apiKey;
  }

  private async _invokeApi(params: ArkChatCompletionRequest) {
    if (!params.model) {
      throw new Error('model is required');
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response;
  }

  async request(params: ArkChatCompletionRequest) {
    const requestParams = {
      ...params,
      stream: false,
    };
    const response = await this._invokeApi(requestParams);

    return response.json() as Promise<ArkChatCompletionResponse>;
  }

  async *stream(params: ArkChatCompletionRequest): AsyncGenerator<ArkChatCompletionStreamResponse> {
    const requestParams: ArkChatCompletionRequest = {
      ...params,
      stream: true,
      stream_options: {
        include_usage: true,
        chunk_include_usage: true,
      },
    };

    const response = await this._invokeApi(requestParams);

    const body = response.body;

    if (!body) {
      throw new Error('Response body is null');
    }

    const reader = body.getReader();

    const decoder = new TextDecoder();

    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === '' || trimmed === '[DONE]') {
          continue;
        }

        if (trimmed.startsWith('data: ')) {
          const data = trimmed.slice(6);
          try {
            const parsed = JSON.parse(data) as ArkChatCompletionStreamResponse;
            yield parsed;
          } catch {}
        }
      }
    }
  }
}
