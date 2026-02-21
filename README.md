# volcengine-ark-sdk

火山引擎 | 火山方舟 TypeScript SDK

官方文档: https://www.volcengine.com/docs/82379/1494384?lang=zh

> 声明: 非官方 SDK

官方未提供 TypeScript SDK，且 openai sdk 兼容方案诸多属性不支持，如 `reasoning_content`，并且需要引入 `openapi` 库才能使用。

基于火山引擎 openapi 规范实现的 TypeScript SDK，仅支持 Chat API （对话 API）。

## 安装

```bash
pnpm add volcengine-ark-sdk

> yarn add volcengine-ark-sdk
> npm install volcengine-ark-sdk
```

## 使用

### 初始化 Client

- `apiKey`: 火山引擎方舟的 api key
- `baseUrl`: 火山引擎方舟的 base url，默认值为 `https://ark.cn-beijing.volces.com/api/v3/chat/completions`

```typescript
import { ArkChatCompletions } from 'volcengine-ark-sdk';

const apiKey = ''; // 火山引擎方舟的 api key

const client = new ArkChatCompletions({
  apiKey,
});
```

### 非流式请求

```typescript
const model = ''; // 模型名称或火山引擎方舟的接入点（多模型混用的场景）

const response = await client.request({
    model,
    messages: [
      {
        role: 'user',
        content: '你好',
      },
    ],
});
```

读取 content

```typescript
const content = response.choices[0].message.content;
```
读取 reasoning_content

```typescript
const reasoningContent = response.choices[0].message.reasoning_content;
```



### 流式请求

```typescript
const model = ''; // 模型名称或火山引擎方舟的接入点（多模型混用的场景）

const response = await client.stream({
    model,
    messages: [
      {
        role: 'user',
        content: '你好',
      },
    ],
});

for await (const chunk of response) {
    console.log(chunk);
}
```
读取 content

```typescript
const content = chunk.choices[0].delta.content;
```
读取 reasoning_content

```typescript
const reasoningContent = chunk.choices[0].delta.reasoning_content;
```

## 响应结构

### 非流式请求

```typescript
{
    "choices": [
        {
            "finish_reason": "stop",
            "index": 0,
            "logprobs": null,
            "message": {
                "content": "你好呀，很高兴和你交流，有什么问题或者想聊的都可以告诉我~",
                "reasoning_content": "用户现在说“你好”，我需要友好回应。首先，保持自然亲切，比如“你好呀，很高兴和你交流，有什么问题或者想聊的都可以告诉我~”这样就可以了，既回应了问候，又开放了对话。",
                "role": "assistant"
            }
        }
    ],
    "created": 1771690638,
    "id": "",
    "model": "doubao-seed-1-6-thinking-agent-preview", // 实际使用的模型
    "service_tier": "default",
    "object": "chat.completion",
    "usage": {
        "completion_tokens": 78,
        "prompt_tokens": 34,
        "total_tokens": 112,
        "prompt_tokens_details": {
            "cached_tokens": 0
        },
        "completion_tokens_details": {
            "reasoning_tokens": 58
        }
    }
}
```

## 流式请求响应结构

```typescript
{
    "choices": [
      {
        "delta": {
          "content": "~",
          "role": "assistant"
        },
        "index": 0
      }
    ],
    "created": 1771689823,
    "id": "021771689812785933bcb8fff5a6e275f05e6439785ee79b003a5",
    "model": "doubao-seed-1-6-thinking-agent-preview",
    "service_tier": "default",
    "object": "chat.completion.chunk",
    "usage": {
      "completion_tokens": 73,
      "prompt_tokens": 34,
      "total_tokens": 107,
      "prompt_tokens_details": {
        "cached_tokens": 0,
        "text_tokens": 34
      },
      "completion_tokens_details": {
        "reasoning_tokens": 50
      }
    }
  }
  
// 每个 chunk 都是一个增量响应，usage 表示截止当前 chunk 的消耗数据，最后一个 chunk 表示整体消耗的 token 数据
{
    "choices": [
      {
        "delta": {
          "content": "",
          "role": "assistant"
        },
        "finish_reason": "stop",
        "index": 0
      }
    ],
    "created": 1771689823,
    "id": "",
    "model": "doubao-seed-1-6-thinking-agent-preview",
    "service_tier": "default",
    "object": "chat.completion.chunk",
    "usage": {
      "completion_tokens": 73,
      "prompt_tokens": 34,
      "total_tokens": 107,
      "prompt_tokens_details": {
        "cached_tokens": 0,
        "text_tokens": 34
      },
      "completion_tokens_details": {
        "reasoning_tokens": 50
      }
    }
  }

// 默认有一个空 chunk，最后一个 chunk 表示整体消耗的 token 数据
  {
    "choices": [],
    "created": 1771689823,
    "id": "",
    "model": "doubao-seed-1-6-thinking-agent-preview",
    "object": "chat.completion.chunk",
    "usage": {
      "completion_tokens": 73,
      "prompt_tokens": 34,
      "total_tokens": 107,
      "prompt_tokens_details": {
        "cached_tokens": 0
      },
      "completion_tokens_details": {
        "reasoning_tokens": 50
      }
    }
  }
```