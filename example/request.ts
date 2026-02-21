import { ArkChatCompletions } from '@/chat-completions';

const apiKey = ''; // 火山引擎方舟的 api key
const model = ''; // 火山引擎方舟的接入点

const client = new ArkChatCompletions({
  apiKey,
});

const response = await client.request({
  model,
  messages: [
    {
      role: 'user',
      content: '你好',
    },
  ],
});

console.log(JSON.stringify(response));

/**
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
*/

/**
 * 异常响应示例
 *
 * Error: {"error":{"code":"AuthenticationError","message":"The API key format is incorrect. Request id: xxxxx","param":"","type":"Unauthorized"}}
 */
