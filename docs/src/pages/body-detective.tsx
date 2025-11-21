import React, { useEffect, useMemo, useRef, useState } from 'react'
import Layout from '@theme/Layout'
import Head from '@docusaurus/Head'

type Msg = { role: 'user' | 'ai'; content: string; imageUrl?: string }

const systemPrompt = `你是“AI 身体侦探”。说人话、给结论、给动作，直接有效。结构：
结论 → 原因 → 风险 → 今日行动（动作/组数/频率） → 复盘指标。`

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

function aiTextFor(input: string, hasImage: boolean): string {
  const tag = hasImage ? '（已读取体态图像）' : ''
  return [
    `结论：与你的描述相关的主要问题是姿势代偿与肌力不均衡${tag}`,
    `原因：久坐与训练模式导致胸椎活动度不足、髋屈肌紧张、肩胛控制弱。`,
    `风险：继续照旧可能加重局部炎症与代偿路径。`,
    `今日行动：90/90呼吸 3×5；滚轴胸椎伸展 2×8；面拉 3×12；臀桥 3×10；髂腰肌拉伸 3×30秒。每周4次。`,
    `复盘：疼痛(0-10)、僵硬评分、面拉与臀桥负重进展。`
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
    await new Promise(r => setTimeout(r, 300))
    const aiMsg: Msg = { role: 'ai', content: `${systemPrompt}\n\n${aiTextFor(text, Boolean(imageUrl))}` }
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

  function clearAll() {
    setMessages([])
    setImageUrl(undefined)
  }

  function resetCredits() {
    setCredits(2)
    setCreditsState(2)
  }

  return (
    <Layout title="AI 身体侦探">
      <Head>
        <title>AI 身体侦探</title>
        <meta name="description" content="AI 驱动的线上生物力学诊所" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">AI 身体侦探</h1>
              <p className="text-slate-300">前 2 次免费诊断，第 3 次付费解锁（$19.90/月）</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-200">剩余：{credits}</span>
              <button className="px-3 py-1 rounded bg-slate-700 text-white hover:bg-slate-600" onClick={resetCredits}>重置额度</button>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md shadow-xl">
            <div className="p-4 flex gap-2">
              <input className="flex-1 px-4 py-3 rounded-lg bg-white/20 text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400" type="text" placeholder="输入你的症状或训练困惑" value={input} onChange={e => setInput(e.target.value)} />
              <button className="px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50" onClick={handleSend} disabled={!input}>发送</button>
              <button className="px-4 py-3 rounded-lg bg-slate-700 text-white hover:bg-slate-600" onClick={handlePickImage}>上传图片</button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
            </div>
            {imageUrl && (
              <div className="px-4 pb-2">
                <img src={imageUrl} alt="体态图像" className="rounded-xl border border-white/10" />
              </div>
            )}
            <div className="px-4 pb-4">
              <div className="flex gap-2 mb-3">
                <button className="px-3 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600" onClick={clearAll}>清空对话</button>
                <button className="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500" onClick={openCheckout}>去订阅</button>
              </div>
              <div className="space-y-4">
                {messages.map((m, i) => (
                  <div key={i} className={m.role === 'user' ? 'bg-white/10 rounded-xl p-4 text-white' : 'bg-slate-900/50 rounded-xl p-4 text-slate-200'}>
                    <div className="font-semibold mb-1">{m.role === 'user' ? '你' : 'AI 侦探'}</div>
                    <div className="whitespace-pre-wrap text-sm">{m.content}</div>
                    {m.imageUrl && <img src={m.imageUrl} alt="附图" className="mt-3 rounded-xl border border-white/10" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {paywallOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="max-w-md w-full rounded-2xl bg-white p-6 shadow-xl">
            <div className="text-xl font-bold mb-2">侦探档案库已锁</div>
            <div className="text-slate-700 mb-4">解锁月度会员（$19.90）继续追踪你的身体真相。</div>
            <div className="flex gap-3">
              <button className="px-4 py-2 rounded-lg bg-slate-800 text-white" onClick={() => setPaywallOpen(false)}>稍后</button>
              <button className="px-4 py-2 rounded-lg bg-blue-600 text-white" onClick={openCheckout}>去支付</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}