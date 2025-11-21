import React, { useEffect, useMemo, useRef, useState } from 'react'
import Layout from '@theme/Layout'
import Head from '@docusaurus/Head'

type Msg = { role: 'user' | 'ai'; content: string; imageUrl?: string }

const systemPrompt = `你是“AI 身体侦探”，以简洁、冷静、专业的侦探口吻给出基于生物力学的分析与行动建议。直击痛点，不说空话，不给泛泛的医学免责声明。输出结构：
1) 结论
2) 机制与证据
3) 风险点
4) 训练与行动方案（具体到动作、组数、频率）
5) 复盘指标`

function initCredits(): number {
  const raw = localStorage.getItem('bd_credits')
  if (raw === null) {
    localStorage.setItem('bd_credits', '2')
    return 2
  }
  const n = parseInt(raw, 10)
  if (Number.isNaN(n)) {
    localStorage.setItem('bd_credits', '2')
    return 2
  }
  return n
}

function setCredits(n: number) {
  localStorage.setItem('bd_credits', String(n))
}

function formatAIResponse(input: string, hasImage: boolean): string {
  const base = input.trim()
  const img = hasImage ? '（已读取体态图像）' : ''
  return [
    `结论：你的主要不适与“肌力失衡”和“姿势代偿”相关${img}`,
    `机制与证据：从你的描述中可见疼痛触发于负重或久坐，推测肩胛控制不足、髋屈肌张力偏高、胸椎活动度受限。`,
    `风险点：继续在现有模式下训练可能强化代偿，增加局部炎症风险。`,
    `训练与行动方案：
    - 呼吸与胸椎活动：90/90 呼吸训练 3 组×5 呼吸；滚轴胸椎伸展 2 组×8 次。
    - 肩胛与后链：站姿面拉 3 组×12；臀桥 3 组×10。
    - 髋前侧释放：髂腰肌拉伸 3 组×30 秒；弓步髋伸展 2 组×8。
    频率：每周 4 次，间隔至少 24 小时。`,
    `复盘指标：
    - 疼痛强度（0-10）
    - 久坐后僵硬评分
    - 面拉与臀桥负重进展`
  ].join('\n')
}

export default function BodyDetectivePage(): JSX.Element {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined)
  const [credits, setCreditsState] = useState<number>(0)
  const [paywallOpen, setPaywallOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setCreditsState(initCredits())
  }, [])

  const canAsk = useMemo(() => credits > 0, [credits])

  async function handleSend() {
    const text = input.trim()
    if (!text) return
    if (!canAsk) {
      setPaywallOpen(true)
      return
    }
    const userMsg: Msg = { role: 'user', content: text, imageUrl }
    setMessages(prev => [...prev, userMsg])
    setInput('')

    await new Promise(r => setTimeout(r, 400))
    const aiText = formatAIResponse(text, Boolean(imageUrl))
    const aiMsg: Msg = { role: 'ai', content: `${systemPrompt}\n\n${aiText}` }
    setMessages(prev => [...prev, aiMsg])

    const next = credits - 1
    setCredits(next)
    setCreditsState(next)
    if (next <= 0) setPaywallOpen(true)
  }

  function handlePickImage() {
    fileRef.current?.click()
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    const url = URL.createObjectURL(f)
    setImageUrl(url)
  }

  function openCheckout() {
    window.location.href = '/subscribe'
  }

  function resetDemo() {
    setCredits(2)
    setCreditsState(2)
    setMessages([])
    setImageUrl(undefined)
    setPaywallOpen(false)
  }

  return (
    <Layout title="AI 身体侦探">
      <Head>
        <title>AI 身体侦探</title>
        <meta name="description" content="AI 驱动的线上生物力学诊所" />
        <meta property="og:title" content="AI 身体侦探" />
        <meta property="og:description" content="免费 2 次深度诊断，第 3 次付费解锁" />
      </Head>
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '24px' }}>
        <h1>AI 身体侦探</h1>
        <p>前 2 次深度诊断免费。第 3 次将触发会员解锁（$19.90/月）。</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span>剩余诊断次数：{credits}</span>
          <button onClick={resetDemo}>重置演示</button>
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
          <input
            type="text"
            placeholder="输入你的症状或训练困惑"
            value={input}
            onChange={e => setInput(e.target.value)}
            style={{ flex: 1, padding: 12 }}
          />
          <button onClick={handleSend} disabled={!input}>发送</button>
          <button onClick={handlePickImage}>相机/上传</button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFileChange} />
        </div>
        {imageUrl && (
          <div style={{ marginTop: 12 }}>
            <img src={imageUrl} alt="体态图像" style={{ maxWidth: '100%', borderRadius: 8 }} />
          </div>
        )}
        <div style={{ marginTop: 24, borderTop: '1px solid #eee', paddingTop: 16 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 600 }}>{m.role === 'user' ? '你' : 'AI 侦探'}</div>
              <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
              {m.imageUrl && (
                <img src={m.imageUrl} alt="附图" style={{ marginTop: 8, maxWidth: '100%', borderRadius: 8 }} />
              )}
            </div>
          ))}
        </div>

        {paywallOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', padding: 24, borderRadius: 12, maxWidth: 520 }}>
              <h2>侦探档案库已锁</h2>
              <p>解锁月度会员（$19.90）继续追踪你的身体真相。</p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setPaywallOpen(false)}>稍后</button>
                <button onClick={openCheckout}>去支付</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}