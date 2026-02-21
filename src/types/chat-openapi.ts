/**
 * 火山引擎 ARK API 请求类型定义
 * 基于 https://www.volcengine.com/docs/82379/1494384?lang=zh 文档
 */

/**
 * 消息角色类型
 */
export type ArkMessageRole = 'system' | 'user' | 'assistant' | 'tool';

/**
 * 内容模态类型
 */
export type ArkContentType = 'text' | 'image_url' | 'video_url';

/**
 * 图片质量级别
 * - low: 低精度，理解图片的粗略信息
 * - high: 高精度，较为细致地理解图片
 * - xhigh: 超高精度，极为细致地理解图片
 */
export type ArkImageDetail = 'low' | 'high' | 'xhigh';

/**
 * 深度思考模式配置
 */
export interface ArkThinkingConfig {
  /** 是否开启深度思考模式 */
  type: 'enabled' | 'disabled' | 'auto';
}

/**
 * 深度思考工作量配置
 */
export interface ArkReasoningEffort {
  /** 思考工作量级别 */
  effort: 'minimal' | 'low' | 'medium' | 'high';
}

/**
 * 文本内容类型
 */
export interface ArkTextContent {
  /** 内容模态类型，此处应为 text */
  type: 'text';
  /** 文本内容 */
  text: string;
}

/**
 * 图片内容类型
 */
export interface ArkImageContent {
  /** 内容模态类型，此处应为 image_url */
  type: 'image_url';
  /** 图片内容 */
  image_url: {
    /** 图片链接或 Base64 编码 */
    url: string;
    /** 理解图片的精细度：low、high、xhigh */
    detail?: ArkImageDetail;
    /** 输入给模型的图片的像素范围，如不在此范围，图片会被等比例缩放至该范围 */
    image_pixel_limit?: {
      /** 传入图片最小像素限制 */
      min_pixels?: number;
      /** 传入图片最大像素限制，大于此像素则等比例缩小至 max_pixels 字段取值以下 */
      max_pixels?: number;
    };
  };
}

/**
 * 视频内容类型
 * 不支持理解视频中的音频内容
 */
export interface ArkVideoContent {
  /** 内容模态类型，此处应为 video_url */
  type: 'video_url';
  /** 视频内容 */
  video_url: {
    /** 视频链接或视频的 Base64 编码 */
    url: string;
    /** 抽帧频率，取值范围：[0.2, 5] */
    fps?: number;
  };
}

/**
 * 多模态内容项（文本、图片、视频）
 */
export type ArkMultimodalContentItem = ArkTextContent | ArkImageContent | ArkVideoContent;

/**
 * 消息内容类型 - 可以是纯文本字符串或多模态内容数组
 */
export type ArkMessageContent = string | ArkMultimodalContentItem[];

/**
 * 系统消息
 * 模型需遵循的指令，包括扮演的角色、背景信息等
 */
export interface ArkSystemMessage {
  /** 发送消息的角色，此处应为 system */
  role: 'system';
  /** 系统消息的内容，可以是纯文本或多模态内容 */
  content: ArkMessageContent;
}

/**
 * 用户消息
 * 用户角色发送的消息，不同模型支持不同的字段类型
 */
export interface ArkUserMessage {
  /** 发送消息的角色，此处应为 user */
  role: 'user';
  /** 用户信息内容，可以是纯文本或多模态内容 */
  content: ArkMessageContent;
}

/**
 * 模型消息
 * 历史对话中，模型角色返回的消息。用以保持对话一致性，多在多轮对话及续写模式使用
 */
export interface ArkAssistantMessage {
  /** 发送消息的角色，此处应为 assistant */
  role: 'assistant';
  /** 模型消息的内容 */
  content: string;
  /** 模型是否调用了工具 */
  tool_calls?: ArkToolCall[];
  /** 工具调用的 ID */
  tool_call_id?: string;
}

/**
 * 工具调用
 */
export interface ArkToolCall {
  /** 工具调用 ID */
  id: string;
  /** 工具调用类型 */
  type: 'function';
  /** 调用的函数 */
  function: {
    /** 函数名称 */
    name: string;
    /** 函数参数（JSON 字符串） */
    arguments: string;
  };
}

/**
 * 工具消息
 * 历史对话中，调用工具返回的消息。工具调用场景中使用
 */
export interface ArkToolMessage {
  /** 发送消息的角色，此处应为 tool */
  role: 'tool';
  /** 工具返回的内容 */
  content: string;
  /** 工具调用的 ID */
  tool_call_id: string;
}

/**
 * 消息联合类型
 */
export type ArkMessage = ArkSystemMessage | ArkUserMessage | ArkAssistantMessage | ArkToolMessage;

/**
 * 缓存配置
 */
export interface ArkCaching {
  /** 缓存类型 */
  type: 'enabled' | 'disabled';
  /** 是否启用前缀缓存 */
  prefix?: boolean;
}

/**
 * 文本格式配置
 */
export interface ArkTextFormat {
  /** 文本格式类型 */
  format:
    | { type: 'text' }
    | { type: 'json_object' }
    | {
        type: 'json_schema';
        /** 用户自定义的 JSON 结构的名称 */
        name: string;
        /** 回复格式的 JSON 格式定义，以 JSON Schema 对象的形式描述 */
        schema: Record<string, any>;
        /** 回复用途描述，模型将根据此描述决定如何以该格式回复 */
        description?: string;
        /** 是否在生成输出时，启用严格遵循模式 */
        strict?: boolean;
      };
}

/**
 * 函数工具定义
 */
export interface ArkFunctionDefinition {
  /** 工具类型 */
  type: 'function';
  /** 调用的函数的名称 */
  name: string;
  /** 调用函数的描述，大模型会用它来判断是否调用这个函数 */
  description: string;
  /** 函数请求参数，以 JSON Schema 格式描述 */
  parameters: Record<string, any>;
  /** 是否强制执行严格的参数验证 */
  strict?: boolean;
}

/**
 * 工具定义
 */
export type ArkToolDefinition = ArkFunctionDefinition;

/**
 * ARK API 请求体
 */
export interface ArkChatCompletionRequest {
  /**
   * 必选
   * 您需要调用的模型的 ID（Model ID），开通模型服务，并查询 Model ID。
   * 支持的模型请参见 https://www.volcengine.com/docs/82379/1330310?lang=zh
   */
  model: string;

  /**
   * 必选
   * 消息列表，不同模型支持不同类型的消息，如文本、图片、视频等
   */
  messages: ArkMessage[];

  /**
   * 在模型上下文中插入系统消息或者开发者作为第一条指令。
   * 当与 previous_response_id 一起使用时，前一个回复中的指令不会被继承到下一个回复中。
   * 不可与缓存能力一起使用
   */
  instructions?: string;

  /**
   * 模型输出最大 token 数，包含模型回答和思维链内容
   */
  max_tokens?: number;

  /**
   * 控制模型是否开启深度思考模式
   * @default {"type":"enabled"}
   */
  thinking?: ArkThinkingConfig;

  /**
   * 限制深度思考的工作量
   * @default {"effort":"medium"}
   */
  reasoning?: ArkReasoningEffort;

  /**
   * 是否开启缓存
   * 不可与 instructions 字段、tools（除自定义函数 Function Calling 外）字段一起使用
   */
  caching?: ArkCaching;

  /**
   * 是否储存生成的模型响应，以便后续通过 API 检索
   * @default true
   */
  store?: boolean;

  /**
   * 响应内容是否流式返回
   */
  stream?: boolean;

  /**
   * 流式响应选项
   */
  stream_options?: {
    /** 模型流式输出时，是否在输出结束前输出本次请求的 token 用量信息。
     * true：在 data: [DONE] 消息之前会返回一个额外的 chunk。此 chunk 中， usage 字段中输出整个请求的 token 用量，choices 字段为空数组。
     * false：输出结束前，没有一个 chunk 来返回 token 用量信息。
     */
    include_usage?: boolean;
    /**
     * 模型流式输出时，输出的每个 chunk 中是否输出本次请求到此 chunk 输出时刻的累计 token 用量信息。
     * true：在返回的 usage 字段中，输出本次请求到此 chunk 输出时刻的累计 token 用量。
     * false：不在每个 chunk 都返回 token 用量信息。
     */
    chunk_include_usage?: boolean;
  };

  /**
   * 采样温度。控制了生成文本时对每个候选词的概率分布进行平滑的程度
   * 取值范围：[0, 2]
   * @default 1
   */
  temperature?: number;

  /**
   * 核采样概率阈值。模型会考虑概率质量在 top_p 内的 token 结果
   * 取值范围：[0, 1]
   * @default 0.7
   */
  top_p?: number;

  /**
   * 模型文本输出的格式定义，可以是自然语言，也可以是结构化的 JSON 数据
   * 该能力尚在 beta 阶段
   */
  text?: ArkTextFormat;

  /**
   * 模型可以调用的工具，当您需要让模型调用工具时，需要配置该结构体
   */
  tools?: ArkToolDefinition[];

  /**
   * 最大工具调用轮次（一轮里不限制次数）
   * 取值范围：[1, 10]
   */
  max_tool_calls?: number;

  /**
   * 用于实现对话续写功能的引用回复 ID
   * 仅适用于非流式输出
   */
  previous_response_id?: string;

  /**
   * 请求 ID，用于追踪和去重
   */
  request_id?: string;

  /**
   * 是否返回 token 使用量
   * @default false
   */
  extra?: {
    /** 是否返回 token 使用量 */
    math?: boolean;
    /** 是否返回内容安全检测结果 */
    content_policy?: boolean;
  };

  /**
   * 额外请求参数
   */
  [key: string]: any;
}

/**
 * 消息内容安全检测结果
 */
export interface ArkContentSafetyOutput {
  /** 违规内容分类 */
  category: string;
  /** 置信度 */
  probability: number;
  /** 是否命中 */
  detected: boolean;
}

/**
 * Token 使用量统计
 */
export interface ArkUsage {
  /** 输入 token 数量 */
  input_tokens: number;
  /** 输出 token 数量 */
  output_tokens: number;
  /** 缓存命中的 token 数量 */
  cached_tokens?: number;
}

/**
 * 模型输出内容块
 */
export interface ArkContentBlock {
  /** 内容类型 */
  type: 'text' | 'image' | 'tool_use' | 'tool_result';
  /** 文本内容 */
  text?: string;
  /** 工具调用信息 */
  tool_use?: {
    /** 工具调用 ID */
    id: string;
    /** 工具名称 */
    name: string;
    /** 工具输入参数 */
    input: Record<string, any>;
  };
  /** 工具返回结果 */
  tool_result?: {
    /** 工具调用 ID */
    tool_call_id: string;
    /** 工具返回内容 */
    content: string;
  };
}

/**
 * ARK API 响应消息
 */
export interface ArkResponseMessage {
  /** 消息角色 */
  role: 'assistant' | 'tool';
  /** 消息内容 */
  content: ArkContentBlock[];
  /** 模型是否调用了工具 */
  tool_calls?: ArkToolCall[];
  /** 工具调用 ID */
  tool_call_id?: string;
}

/**
 * ARK API 错误响应体
 */
export interface ArkChatCompletionErrorResponse {
  error: {
    code: string;
    message: string;
    type: string;
    param: string;
  };
}

/**
 * ARK API 响应体
 */
export interface ArkChatCompletionResponse {
  /** ID */
  id: string;
  /** 对象类型 */
  object: string;
  /** 创建时间戳 */
  created: number;
  /** 模型名称 */
  model: string;
  /** 响应消息 */
  choices: Array<{
    /** 消息索引 */
    index: number;
    /** 响应消息 */
    message: ArkResponseMessage;
    /** 完成原因 */
    finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | 'error';
  }>;
  /**
   * 本次请求的 token 用量。
   * 流式调用时，默认不统计 token 用量信息，返回值为null。
   * 如需统计，需设置 stream_options.include_usage为true。
   */
  usage?: ArkUsage;
  /** 内容安全检测结果 */
  content_safety_results?: ArkContentSafetyOutput[];
}

/**
 * 流式响应的内容块
 */
export interface ArkStreamChunkDelta {
  // 内容输出的角色，此处固定为 assistant。
  role: 'assistant';
  content: string;
  // 模型处理问题的思维链内容。
  // 仅深度推理模型支持返回此字段，深度推理模型请参见支持模型。
  reasoning_content?: string;

  tool_calls?: ArkToolCall[];
}

/**
 * 流式响应的选择
 */
export interface ArkStreamChoice {
  /** 消息索引 */
  index: number;
  /** 模型停止生成 token 的原因。取值范围：
   * stop：模型输出自然结束，或因命中请求参数 stop 中指定的字段而被截断。
   * length：模型输出因达到模型输出限制而被截断，有以下原因：
   * 触发max_tokens限制（回答内容的长度限制）。
   * 触发max_completion_tokens限制（思维链内容+回答内容的长度限制）。
   * 触发context_window限制（输入内容+思维链内容+回答内容的长度限制）。
   * content_filter：模型输出被内容审核拦截。
   * tool_calls：模型调用了工具。
   */
  finish_reason?: 'stop' | 'length' | 'tool_calls' | 'content_filter' | 'error';
  delta?: ArkStreamChunkDelta;
}

/**
 * ARK API 流式响应体
 */
export interface ArkChatCompletionStreamResponse {
  /** ID */
  id: string;
  /** 对象类型 */
  object: 'chat.completion.chunk';
  /** 创建时间戳 */
  created: number;
  /** 模型名称 */
  model: string;
  /** 响应选择 */
  choices: ArkStreamChoice[];
  /** Token 使用量 */
  usage?: ArkUsage;
}
