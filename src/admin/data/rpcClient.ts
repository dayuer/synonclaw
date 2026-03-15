// @alpha: RPC 指令翻译中心 — GUI 操作 → RPC 协议指令

import type { RpcConfig, RpcCommand, RpcMethod, ChatMessage } from './types'

// @alpha: 模拟 AI 回复库
const AI_RESPONSES = [
  '收到，让我分析一下你的请求...',
  '好的，我正在处理中。这个任务大概需要几秒钟。',
  '已完成分析。以下是我的建议：\n\n1. 首先确认需求范围\n2. 设计合理的数据结构\n3. 编写测试用例\n4. 逐步实现核心逻辑',
  '理解了。我会按照你的要求来执行，如果有任何疑问我会及时向你确认。',
  '这是一个很好的问题。从技术角度来看，有几个方案可以考虑...',
  '任务已完成。请检查结果是否符合预期。如有需要调整的地方，请告诉我。',
]

// @alpha: 生成唯一 ID
const uid = (): string => `rpc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`

// @alpha: 比较两个 RpcConfig，返回变更的 RPC 指令列表
export const translateConfigToCommands = (
  deviceId: string,
  oldConfig: RpcConfig,
  newConfig: RpcConfig,
): RpcCommand[] => {
  const commands: RpcCommand[] = []
  const now = new Date().toLocaleString('zh-CN')

  const emit = (method: RpcMethod, params: Record<string, unknown>): void => {
    commands.push({ id: uid(), deviceId, method, params, timestamp: now, status: 'pending' })
  }

  if (oldConfig.modelProvider !== newConfig.modelProvider) {
    emit('SET_MODEL_PROVIDER', { provider: newConfig.modelProvider })
  }
  if (oldConfig.apiKey !== newConfig.apiKey) {
    emit('SET_API_KEY', { apiKey: newConfig.apiKey })
  }
  if (oldConfig.temperature !== newConfig.temperature) {
    emit('SET_TEMPERATURE', { temperature: newConfig.temperature })
  }
  if (oldConfig.topP !== newConfig.topP) {
    emit('SET_TOP_P', { topP: newConfig.topP })
  }
  if (oldConfig.maxTokens !== newConfig.maxTokens) {
    emit('SET_MAX_TOKENS', { maxTokens: newConfig.maxTokens })
  }
  if (oldConfig.systemPrompt !== newConfig.systemPrompt) {
    emit('SET_SYSTEM_PROMPT', { systemPrompt: newConfig.systemPrompt })
  }

  // @alpha: 比较插件状态变更
  newConfig.plugins.forEach((plugin, idx) => {
    const oldPlugin = oldConfig.plugins[idx]
    if (oldPlugin && oldPlugin.enabled !== plugin.enabled) {
      emit('TOGGLE_PLUGIN', { pluginId: plugin.id, enabled: plugin.enabled })
    }
  })

  return commands
}

// @alpha: 模拟执行 RPC 指令（异步）
export const executeCommands = async (commands: RpcCommand[]): Promise<RpcCommand[]> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300))
  return commands.map(cmd => ({ ...cmd, status: 'success' as const }))
}

// @alpha: 模拟发送聊天消息并获取 AI 回复
export const sendChatMessage = async (
  _deviceId: string,
  _message: string,
): Promise<Omit<ChatMessage, 'id' | 'timestamp'>> => {
  // 模拟 AI 思考延迟（800ms ~ 2000ms）
  const delay = 800 + Math.random() * 1200
  await new Promise(resolve => setTimeout(resolve, delay))

  const response = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)]
  return { role: 'assistant', content: response }
}

// @alpha: 校验 RPC 配置
export const validateRpcConfig = (config: RpcConfig): Record<string, string> => {
  const errors: Record<string, string> = {}

  if (!config.apiKey.trim()) {
    errors.apiKey = 'API Key 不能为空'
  }
  if (config.temperature < 0 || config.temperature > 2) {
    errors.temperature = '温度值必须在 0.0 ~ 2.0 之间'
  }
  if (config.topP < 0 || config.topP > 1) {
    errors.topP = 'Top-P 必须在 0.0 ~ 1.0 之间'
  }
  if (config.maxTokens < 1 || config.maxTokens > 128000) {
    errors.maxTokens = 'Max Tokens 必须在 1 ~ 128000 之间'
  }
  if (config.systemPrompt.length > 10000) {
    errors.systemPrompt = '系统 Prompt 不能超过 10000 字符'
  }

  return errors
}
