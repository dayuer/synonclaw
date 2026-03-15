// @alpha: 成员工作台 — 纯净使用体验，无配置入口
import { useState, useEffect, useCallback, useRef } from 'react'
import {
  getWorkersByMemberId, getConversations, createConversation,
  addMessageToConversation, getConversationById, getDeviceById,
} from '../data/mockData'
import { sendChatMessage } from '../data/rpcClient'
import type { DigitalWorker, Conversation, ChatMessage } from '../data/types'

// @alpha: 模拟当前登录成员 — 默认为 m2（李明）
const CURRENT_MEMBER_ID = 'm2'

export default function WorkspacePage() {
  const [workers, setWorkers] = useState<DigitalWorker[]>([])
  const [convList, setConvList] = useState<Conversation[]>([])
  const [activeConv, setActiveConv] = useState<Conversation | null>(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [view, setView] = useState<'workers' | 'chat'>('workers')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const refresh = useCallback(() => {
    setWorkers(getWorkersByMemberId(CURRENT_MEMBER_ID))
    setConvList(getConversations(CURRENT_MEMBER_ID))
  }, [])

  useEffect(() => { refresh() }, [refresh])

  // @alpha: 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConv?.messages.length])

  const startChat = (worker: DigitalWorker) => {
    const device = getDeviceById(worker.deviceId)
    if (device && device.status !== 'online') return // 设备离线不可用

    const conv = createConversation(CURRENT_MEMBER_ID, worker.id)
    setActiveConv(conv)
    setView('chat')
    refresh()
  }

  const openConversation = (conv: Conversation) => {
    const full = getConversationById(conv.id)
    if (full) {
      setActiveConv(full)
      setView('chat')
    }
  }

  const handleSend = async () => {
    if (!input.trim() || !activeConv || sending) return

    const msgContent = input.trim()
    setInput('')
    setSending(true)

    // 添加用户消息
    addMessageToConversation(activeConv.id, { role: 'user', content: msgContent })
    const updated = getConversationById(activeConv.id)
    if (updated) setActiveConv(updated)

    // 获取关联设备 ID
    const worker = workers.find(w => w.id === activeConv.workerId)
    const deviceId = worker?.deviceId || ''

    // @alpha: Mock AI 回复
    const response = await sendChatMessage(deviceId, msgContent)
    addMessageToConversation(activeConv.id, response)
    const afterReply = getConversationById(activeConv.id)
    if (afterReply) setActiveConv(afterReply)

    setSending(false)
    refresh()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // 对话界面
  if (view === 'chat' && activeConv) {
    const worker = workers.find(w => w.id === activeConv.workerId)

    return (
      <div className="workspace-chat">
        {/* 对话顶栏 */}
        <div className="workspace-chat__header">
          <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => { setView('workers'); setActiveConv(null) }}>
            ← 返回
          </button>
          <div className="workspace-chat__worker-info">
            <span className="workspace-chat__worker-name">🤖 {activeConv.workerName}</span>
            {worker && <span className="workspace-chat__worker-desc">{worker.description}</span>}
          </div>
        </div>

        {/* 消息列表 */}
        <div className="workspace-chat__messages">
          {activeConv.messages.length === 0 && (
            <div className="workspace-chat__empty">
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🤖</div>
              <p style={{ fontWeight: 600, marginBottom: 'var(--space-sm)' }}>你好！我是{activeConv.workerName}</p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-small)' }}>
                {worker?.description || '有什么可以帮你的？'}
              </p>
            </div>
          )}
          {activeConv.messages.map((msg: ChatMessage) => (
            <div key={msg.id} className={`chat-message chat-message--${msg.role}`}>
              <div className="chat-message__avatar">
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>
              <div className="chat-message__content">
                <div className="chat-message__text">{msg.content}</div>
                <div className="chat-message__time">{msg.timestamp}</div>
              </div>
            </div>
          ))}
          {sending && (
            <div className="chat-message chat-message--assistant">
              <div className="chat-message__avatar">🤖</div>
              <div className="chat-message__content">
                <div className="chat-message__text chat-message__typing">思考中...</div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 输入框 */}
        <div className="workspace-chat__input-area">
          <textarea
            className="workspace-chat__input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="输入消息... (Enter 发送)"
            rows={1}
            disabled={sending}
          />
          <button
            className="admin-btn admin-btn--primary"
            onClick={handleSend}
            disabled={!input.trim() || sending}
            style={{ height: 40, minWidth: 72 }}
          >
            发送
          </button>
        </div>
      </div>
    )
  }

  // 数字员工列表（工作台首页）
  return (
    <div className="workspace">
      <div className="workspace__header">
        <h1 className="workspace__title">我的工作台</h1>
        <p className="workspace__subtitle">选择数字员工开始对话</p>
      </div>

      {/* 数字员工卡片 */}
      <div className="workspace__grid">
        {workers.length === 0 ? (
          <div className="admin-empty" style={{ gridColumn: '1 / -1', padding: 'var(--space-3xl)' }}>
            <div className="admin-empty__icon">🤖</div>
            <p className="admin-empty__title">暂无分配的数字员工</p>
            <p className="admin-empty__desc">请联系管理员为你分配 AI 员工</p>
          </div>
        ) : workers.map(w => {
          const device = getDeviceById(w.deviceId)
          const isAvailable = device?.status === 'online' && w.status === 'active'

          return (
            <div key={w.id} className={`workspace-card ${!isAvailable ? 'workspace-card--disabled' : ''}`}
              onClick={() => isAvailable && startChat(w)}
            >
              <div className="workspace-card__icon">🤖</div>
              <h3 className="workspace-card__name">{w.name}</h3>
              <p className="workspace-card__desc">{w.description}</p>
              <div className="workspace-card__status">
                {isAvailable ? (
                  <span className="status-badge status-badge--online">
                    <span className="status-badge__dot" />可用
                  </span>
                ) : (
                  <span className="status-badge status-badge--offline">
                    <span className="status-badge__dot" />不可用{device?.status !== 'online' ? '(设备离线)' : ''}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* 历史对话 */}
      {convList.length > 0 && (
        <div style={{ marginTop: 'var(--space-2xl)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-md)' }}>历史对话</h2>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>数字员工</th>
                  <th>消息数</th>
                  <th>开始时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {convList.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.workerName}</td>
                    <td>{c.messages.length} 条</td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{c.createdAt}</td>
                    <td>
                      <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => openConversation(c)}>
                        继续对话
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
