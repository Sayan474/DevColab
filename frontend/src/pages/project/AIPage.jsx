import { useState } from "react";
import { useParams } from "react-router-dom";
import { PageShell } from "../../components/layout/PageShell";
import { Avatar, Button } from "../../components/ui";
import { cn } from "../../assets/utils";
import { Send, Zap, Code, Bug, Cpu, Eye, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import api, { unwrap } from "../../lib/api";

const AIPage = () => {
  const { id: projectId } = useParams();
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([{ role: "ai", text: "Hello! I'm your DevCollab AI Assistant. How can I help you today?" }]);
  const [reviewInput, setReviewInput] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [review, setReview] = useState(null);

  const addAiMessage = async (label, request) => {
    setMessages((prev) => [...prev, { role: "user", text: label }]);
    try {
      const data = unwrap(await request());
      const text = data.summary || data.analysis || data.standup || JSON.stringify(data.subtasks, null, 2);
      setMessages((prev) => [...prev, { role: "ai", text }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "ai", text: err.response?.data?.message || "AI request failed" }]);
    }
  };

  const handleSend = async (text) => {
    const input = text || prompt;
    if (!input) return;
    setPrompt("");
    const lower = input.toLowerCase();
    if (lower.includes("block")) return addAiMessage(input, () => api.post('/ai/blockers', { projectId }));
    if (lower.includes("standup")) return addAiMessage(input, () => api.post('/ai/standup', { projectId }));
    if (lower.includes("break")) return addAiMessage(input, () => api.post('/ai/breakdown', { feature: input }));
    return addAiMessage(input, () => api.post('/ai/summarise', { projectId }));
  };

  const reviewCode = async () => {
    const data = unwrap(await api.post('/ai/review-code', { code: reviewInput, language }));
    setReview(data.review);
  };

  return (
    <PageShell breadcrumbs={["Projects", "AI Assistant"]}>
      <div className="h-full flex gap-6 overflow-hidden">
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex-1 surface rounded-2xl flex flex-col overflow-hidden border">
            <div className="p-4 border-b dark:border-dark-border flex items-center gap-3 bg-primary/5"><div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white"><Zap size={18} /></div><div><h2 className="font-bold">DevCollab AI</h2><p className="text-[10px] text-success font-bold uppercase">Online</p></div></div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex gap-4 max-w-[80%]", m.role === "user" ? "ml-auto flex-row-reverse" : "")}>
                  {m.role === "ai" ? <div className="w-8 h-8 rounded-lg bg-primary flex-shrink-0 flex items-center justify-center text-white"><Zap size={14} /></div> : <Avatar src={user?.avatar} size="xs" />}
                  <div className={cn("p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap", m.role === "ai" ? "bg-white/5 border border-dark-border rounded-tl-none" : "bg-primary text-white rounded-tr-none")}>{m.text}</div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t dark:border-dark-border space-y-4">
              <div className="flex flex-wrap gap-2 text-[10px]">{["Summarize this project", "What's blocking us?", "Generate standup", "Break down notifications feature"].map((p) => <button key={p} onClick={() => handleSend(p)} className="px-3 py-1.5 rounded-lg border border-dark-border hover:border-primary hover:text-primary font-bold uppercase tracking-widest">{p}</button>)}</div>
              <div className="flex gap-3"><input className="flex-1 bg-black/10 dark:bg-white/5 border border-dark-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary" placeholder="Ask for summary, blockers, standup, or breakdown..." value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} /><Button className="w-12 h-12 p-0 rounded-xl" onClick={() => handleSend()}><Send size={20} /></Button></div>
            </div>
          </div>
        </div>
        <div className="w-[400px] flex flex-col gap-6">
          <div className="surface rounded-2xl p-6 space-y-6 border">
            <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center text-success"><Code size={24} /></div><div><h3 className="font-bold text-lg">AI Code Reviewer</h3><p className="text-xs text-gray-500">Paste code to get instant feedback</p></div></div>
            <textarea value={reviewInput} onChange={(e) => setReviewInput(e.target.value)} className="w-full h-48 bg-black/10 dark:bg-white/5 border border-dark-border rounded-xl p-4 text-xs font-mono outline-none focus:ring-1 focus:ring-primary" placeholder="paste your code here..." />
            <div className="flex gap-2"><select value={language} onChange={(e) => setLanguage(e.target.value)} className="flex-1 bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-xs outline-none"><option>javascript</option><option>python</option><option>typescript</option></select><Button className="flex-1 gap-2" onClick={reviewCode}>Review <Zap size={14} /></Button></div>
            {review && <div className="space-y-4 pt-6 border-t dark:border-dark-border"><div className="flex items-center justify-between"><span className="text-sm font-bold">Review Score</span><div className="w-10 h-10 rounded-full border-4 border-success flex items-center justify-center text-xs font-bold text-success">{review.score}</div></div>{[["Bugs", review.bugs, Bug], ["Performance", review.performance, Cpu], ["Readability", review.readability, Eye], ["Security", review.security, ShieldCheck]].map(([title, items, Icon]) => <div key={title} className="text-xs"><p className="font-bold flex items-center gap-2"><Icon size={14} /> {title}</p><ul className="list-disc pl-5 text-gray-500">{(items || []).map((item) => <li key={item}>{item}</li>)}</ul></div>)}</div>}
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default AIPage;
