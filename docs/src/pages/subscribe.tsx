import React from 'react'
import Layout from '@theme/Layout'

function simulateSuccess() {
  localStorage.setItem('bd_credits', '15')
  window.location.href = '/body-detective'
}

export default function SubscribePage(): JSX.Element {
  return (
    <Layout title="订阅 AI 身体侦探">
      <div style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
        <h1>订阅 AI 身体侦探</h1>
        <p>月度会员 $19.90，每月获得 15 次深度问诊与训练计划生成。</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <a href="#" onClick={e => { e.preventDefault(); simulateSuccess() }}>模拟支付成功（演示）</a>
          <a href="#" onClick={e => { e.preventDefault(); alert('Stripe Checkout 将在后端接入'); }}>前往真实支付（占位）</a>
        </div>
      </div>
    </Layout>
  )
}