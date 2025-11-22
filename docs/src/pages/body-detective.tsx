import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Camera, Send, Lock, CreditCard, 
  Activity, Zap, Loader2, Globe, Search, CheckCircle, 
  AlertTriangle, FileText, PlayCircle, ArrowRight, BookOpen
} from 'lucide-react';
import Layout from '@theme/Layout'; 
import Head from '@docusaurus/Head';

const BodyDetectivePage = () => {
  // --- 状态管理 ---
  const [credits, setCredits] = useState(2);
  const [chatHistory, setChatHistory] = useState([
    {
      role: 'ai',
      content: "👋 嗨，我是你的 AI 身体侦探。\n\n别担心那些听不懂的医学名词。告诉我你**哪里不舒服**（比如：'低头久了脖子酸'），我会用最简单的话告诉你**为什么**，以及**现在该做什么**。",
      type: 'text'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const chatEndRef = useRef(null);

  // --- SEO ---
  const [seoTitle, setSeoTitle] = useState("AI 身体侦探 | 找到疼痛根源");

  // --- API ---
  const apiKey = ""; // 运行时环境变量
  const modelName = "gemini-2.5-flash-preview-09-2025";

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory, isLoading]);

  const handleSend = async () => {
    if (!input.trim()) return;
    if (credits <= 0) { setShowPaywall(true); return; }

    const userMsg = input;
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsLoading(true);
    setCredits(prev => prev - 1);

    if (userMsg.length < 20) setSeoTitle(`${userMsg} 的康复方案 | AI 身体侦探`);

    try {
      const systemPrompt = `
        角色：你是一位经验丰富、说话风趣的康复教练。
        核心任务：
        1. **安抚**：先告诉用户这很常见。
        2. **翻译**：把复杂的生物力学翻译成人话。
        3. **行动**：只给 1-2 个立刻能做的动作。
        4. **出口**：引导观看视频或下载指南。

        请严格按以下 Markdown 格式输出（带 Emoji）：

        ### 💡 发生了什么？ (The Truth)
        (用大白话解释原理...)

        ### 🛠️ 立刻自救 (Quick Fix)
        * **动作 1**：(动作名称) - (怎么做)
        * **动作 2**：(动作名称) - (怎么做)

        ### 🚀 彻底解决 (The Exit)
        (告诉用户需要系统训练，点击下方按钮。)
      `;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userMsg }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] }
          })
        }
      );

      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "侦探正在思考...";
      
      setChatHistory(prev => [...prev, { 
        role: 'ai', 
        content: aiText, 
        type: 'report',
        reportId: 'case-' + Date.now().toString(36)
      }]);

    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'ai', content: "网络开小差了，请重试。", type: 'text' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout title={seoTitle} description="不吃药，不瞎练。AI 帮你找到疼痛根源。">
      <Head>
        <style>{`body { background-color: #050505; }`}</style>
      </Head>

      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-60px)] bg-[#050505] text-gray-100 p-4 font-sans">
        <div className="w-full max-w-4xl h-[85vh] bg-[#111111]/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex flex-col relative overflow-hidden ring-1 ring-white/5">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center z-10 bg-[#111]/50 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-lg font-bold text-white leading-tight">AI 身体侦探</h1>
                      <p className="text-xs text-gray-400">Biomechanics Detective v4.0</p>
                    </div>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border transition-all ${credits > 0 ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                    <Zap className="w-3 h-3 fill-current" />
                    <span>剩余诊断: {credits} 次</span>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                      <div className={`max-w-[95%] md:max-w-[85%] rounded-2xl p-5 md:p-6 relative ${
                          msg.role === 'user' 
                          ? 'bg-[#252525] text-white rounded-tr-none border border-white/10' 
                          : 'bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/5 text-gray-300 rounded-tl-none shadow-xl'
                      }`}>
                          {msg.role === 'ai' && msg.type === 'report' && (
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                  <FileText className="w-4 h-4" /> 侦探报告
                                </span>
                                <span className="text-[10px] text-gray-500">Generated by Gemini AI</span>
                            </div>
                          )}
                          <div className="prose prose-invert prose-sm max-w-none leading-relaxed">
                            {typeof msg.content === 'string' && msg.content.split('\n').map((line, i) => {
                              if (line.startsWith('###')) return <h3 key={i} className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 font-bold text-lg mt-6 mb-3">{line.replace('###', '')}</h3>
                              if (line.startsWith('*')) return <li key={i} className="ml-4 text-gray-300 marker:text-blue-500 mb-1">{line.replace('*', '')}</li>
                              return <p key={i} className="mb-2 text-gray-300">{line}</p>
                            })}
                          </div>
                          {msg.role === 'ai' && msg.type === 'report' && (
                            <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-3">
                              <a href="https://www.youtube.com/@BodyTranslatorAlex" target="_blank" rel="noreferrer" 
                                 className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-blue-900/20 cursor-pointer no-underline">
                                <PlayCircle className="w-4 h-4" /> 观看视频教程
                              </a>
                              <a href="#" className="flex-1 bg-white/5 hover:bg-white/10 text-gray-200 text-sm font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition border border-white/10 cursor-pointer no-underline">
                                <BookOpen className="w-4 h-4" /> 下载自救指南
                              </a>
                            </div>
                          )}
                      </div>
                    </div>
                ))}
                
                {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-[#1a1a1a]/80 backdrop-blur border border-blue-500/20 p-4 rounded-2xl rounded-tl-none flex items-center gap-3 text-sm text-blue-300">
                          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                          <span className="animate-pulse">侦探正在分析你的生物力学链条...</span>
                      </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-5 bg-[#151515]/80 backdrop-blur-md border-t border-white/10 z-20">
                <div className="relative flex items-center max-w-3xl mx-auto">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={credits > 0 ? "简单描述你的症状（如：久坐后腰痛）..." : "今日免费额度已用尽"}
                        disabled={credits <= 0 || isLoading}
                        className="w-full bg-[#0a0a0a] border border-white/10 text-white pl-6 pr-14 py-4 rounded-2xl focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 placeholder-gray-600 text-base shadow-inner transition-all"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={credits <= 0 || isLoading || !input.trim()}
                        className="absolute right-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-3 rounded-xl hover:brightness-110 disabled:grayscale disabled:opacity-50 transition shadow-lg"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Paywall Modal */}
            {showPaywall && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-orange-500/20 rotate-3">
                        <Lock className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-3">解锁完整方案</h2>
                    <p className="text-gray-400 text-sm mb-8 max-w-xs leading-relaxed">
                        免费额度已用尽。订阅会员获取<br/><span className="text-yellow-400 font-bold">专属视频指导</span>。
                    </p>
                    <button 
                        onClick={() => alert("Stripe Link Here")}
                        className="w-full max-w-sm bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:scale-105 transition shadow-xl"
                    >
                        <CreditCard className="w-5 h-5" /> 立即解锁 ($19.90/月)
                    </button>
                    <button onClick={() => setShowPaywall(false)} className="mt-6 text-xs text-gray-600 hover:text-gray-400 underline">稍后再说</button>
                </div>
            )}
        </div>
      </div>
    </Layout>
  );
};

export default BodyDetectivePage;
