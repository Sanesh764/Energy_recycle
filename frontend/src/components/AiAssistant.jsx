import React, { useState } from 'react';
import { SparklesIcon, CloseIcon, CheckCircleIcon, ArrowRightIcon } from './ui/Icons';

const KNOWLEDGE_BASE = [
  {
    q: 'How does e-waste collection work?',
    a: 'E-Waste Passport follows a 5-step verified lifecycle:\n1. Register: Upload a photo and answer condition questions.\n2. AI Triage: Amazon Bedrock suggests Repair, Reuse, Resale, or Recycle.\n3. Request Pickup: Enter your address, pincode, and preferred slot.\n4. Collection & Inspection: An authorized collector collects the unit and conducts physical diagnostic inspection.\n5. Certified Outcome: The collector confirms the final disposition, completing the passport.',
  },
  {
    q: 'How should I prepare my device for handover?',
    a: 'Essential data security and safety steps:\n• Back up your personal files and photos to a personal drive or cloud.\n• Sign out of Apple ID, Google Account, or Windows accounts.\n• Perform a complete factory reset / storage sanitization.\n• Remove SIM cards, memory cards, and protective cases.\n• Never puncture swollen or damaged lithium batteries.',
  },
  {
    q: 'How do I earn reward coins and redeem them?',
    a: '• Earning: You automatically earn +50 green reward coins when an authorized collector marks your device as COLLECTED at your doorstep.\n• Anti-fraud: Duplicate rewards for the same device collection are strictly prevented.\n• Redemption: Visit your Rewards Wallet to redeem coins for grocery vouchers, electric mobility passes, and tech refurbishing discounts.',
  },
  {
    q: 'What types of electronic devices are accepted?',
    a: 'We accept phones, laptops, flat-panel TVs, chargers, batteries, printers, and consumer IT equipment. Each category is tracked under its own digital passport.',
  },
  {
    q: 'Is the AI suggestion the final decision?',
    a: 'No. Per platform specification, the AI triage is strictly advisory ("This is a suggestion"). The certified field collector physically inspects the device at the facility and records the authoritative final outcome.',
  },
];

export function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: 'Hello! I am your E-Waste Guide. Ask me anything about preparing devices, tracking your passport, collection slots, or earning green rewards.',
    },
  ]);
  const [input, setInput] = useState('');

  const handleSelectFaq = (faq) => {
    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: faq.q },
      { sender: 'assistant', text: faq.a },
    ]);
  };

  const handleSend = (e) => {
    e.preventDefault();
    const query = input.trim();
    if (!query) return;

    const matched = KNOWLEDGE_BASE.find(
      (k) =>
        k.q.toLowerCase().includes(query.toLowerCase()) ||
        query.toLowerCase().includes('wipe') && k.q.includes('prepare') ||
        query.toLowerCase().includes('reward') && k.q.includes('reward') ||
        query.toLowerCase().includes('collect') && k.q.includes('collection') ||
        query.toLowerCase().includes('accept') && k.q.includes('accepted')
    );

    const reply = matched
      ? matched.a
      : `Regarding "${query}": E-Waste Passport provides verified doorstep pickups for old electronics, AI triage for disposition (Repair, Reuse, Resale, Recycle), and 50 reward coins upon collection handover. Please refer to your passport timeline or select a quick topic below.`;

    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: query },
      { sender: 'assistant', text: reply },
    ]);
    setInput('');
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 bg-forest-900 hover:bg-forest-950 text-white px-4 py-3 rounded-full shadow-elevated border border-emerald-500/30 transition-all hover:scale-105"
          aria-label="Open AI Assistant"
        >
          <SparklesIcon className="w-5 h-5 text-emerald-300 animate-pulse" />
          <span className="text-xs font-bold tracking-wide font-mono">E-Waste AI Guide</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        </button>
      ) : (
        <div className="w-[360px] sm:w-[400px] h-[520px] bg-white rounded-3xl shadow-elevated border border-zinc-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-zinc-950 text-white p-4 flex items-center justify-between border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-forest-800 flex items-center justify-center text-emerald-300">
                <SparklesIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight">E-Waste Assistant</h3>
                <span className="text-[10px] font-mono text-emerald-400 block">
                  Advisory Guide & Knowledge Base
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              aria-label="Close Assistant"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Quick FAQ Chips */}
          <div className="p-3 bg-zinc-50 border-b border-zinc-100 flex gap-1.5 overflow-x-auto text-[11px] font-mono scrollbar-none">
            {KNOWLEDGE_BASE.slice(0, 3).map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectFaq(item)}
                className="whitespace-nowrap px-2.5 py-1 bg-white border border-zinc-200 hover:border-forest-700 rounded-full text-zinc-700 hover:text-forest-900 transition-colors"
              >
                {item.q.split(' ')[0]} {item.q.split(' ')[1]}...
              </button>
            ))}
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 leading-relaxed whitespace-pre-line ${
                    m.sender === 'user'
                      ? 'bg-forest-900 text-white rounded-br-none'
                      : 'bg-zinc-100 text-zinc-800 rounded-bl-none border border-zinc-200/60'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={handleSend}
            className="p-3 border-t border-zinc-100 bg-white flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about pickups, wiping data, rewards..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 text-xs border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-forest-800"
            />
            <button
              type="submit"
              className="p-2 bg-forest-900 text-white rounded-xl hover:bg-forest-950 transition-colors"
              aria-label="Send query"
            >
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
