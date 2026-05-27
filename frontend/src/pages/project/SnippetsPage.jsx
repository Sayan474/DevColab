import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageShell } from '../../components/layout/PageShell';
import { Badge, Button, Avatar, Input } from '../../components/ui';
import { cn } from '../../assets/utils';
import { Search, Plus, Copy, Trash2, FileCode, Check } from 'lucide-react';
import api, { unwrap } from '../../lib/api';
import { useAuth } from '../../context/useAuth';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import cpp from 'highlight.js/lib/languages/cpp';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import sql from 'highlight.js/lib/languages/sql';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import 'highlight.js/styles/github-dark.css';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('java', java);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('go', go);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('css', css);

const SnippetsPage = () => {
  const { id: projectId } = useParams();
  const { user } = useAuth();
  const [snippets, setSnippets] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState({ title: '', language: 'javascript', code: '', description: '', tags: '' });
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const selectedSnippet = snippets.find((s) => (s._id || s.id) === selectedId);
  const codeRef = useRef(null);

  const load = async () => {
    const data = unwrap(await api.get(`/snippets/project/${projectId}`));
    setSnippets(data.snippets || []);
    setSelectedId((prev) => prev || data.snippets?.[0]?._id || null);
  };

  useEffect(() => { load().catch(() => {}); }, [projectId]);

  useEffect(() => {
    if (!projectId) return;
    api.get(`/projects/${projectId}`).then((res) => setProjectName(unwrap(res).project?.name || '')).catch(() => {});
  }, [projectId]);

  useEffect(() => {
    if (!codeRef.current || !selectedSnippet) return;
    const language = selectedSnippet.language;
    const code = selectedSnippet.code || '';
    codeRef.current.className = 'hljs';
    codeRef.current.removeAttribute('data-language');
    try {
      const highlighted = hljs.getLanguage(language)
        ? hljs.highlight(code, { language }).value
        : hljs.highlightAuto(code).value;
      codeRef.current.innerHTML = highlighted;
    } catch {
      codeRef.current.innerHTML = hljs.highlightAuto(code).value;
    }
  }, [selectedSnippet]);

  const filteredSnippets = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return snippets;
    return snippets.filter((snippet) => {
      const titleMatch = snippet.title?.toLowerCase().includes(query);
      const tagMatch = (snippet.tags || []).some((tag) => tag.toLowerCase().includes(query));
      return titleMatch || tagMatch;
    });
  }, [snippets, search]);

  const saveSnippet = async () => {
    if (!projectId) {
      setSaveError('Project is missing. Please reload the page.');
      return;
    }
    if (!draft.title || !draft.code) {
      setSaveError('Title and code are required.');
      return;
    }
    const detected = hljs.highlightAuto(draft.code, [
      'javascript',
      'typescript',
      'python',
      'java',
      'cpp',
      'go',
      'rust',
      'html',
      'css',
      'sql',
    ]);
    const detectedLanguage = detected.language || '';
    const normalizedSelected = draft.language === 'html' ? 'xml' : draft.language;
    if (detectedLanguage && detectedLanguage !== normalizedSelected) {
      setToast(`Language mismatch. Detected ${detectedLanguage}, selected ${draft.language}.`);
      setTimeout(() => setToast(''), 3000);
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      const data = unwrap(await api.post('/snippets', {
        ...draft,
        projectId,
        tags: draft.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      }));
      setDraft({ title: '', language: 'javascript', code: '', description: '', tags: '' });
      setSnippets((prev) => [data.snippet, ...prev]);
      setSelectedId(data.snippet._id);
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Unable to save snippet');
    } finally {
      setSaving(false);
    }
  };

  const deleteSnippet = async () => {
    if (!selectedSnippet) return;
    await api.delete(`/snippets/${selectedSnippet._id || selectedSnippet.id}`);
    setSnippets((prev) => prev.filter((snippet) => (snippet._id || snippet.id) !== (selectedSnippet._id || selectedSnippet.id)));
    setSelectedId(null);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedSnippet.code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <PageShell breadcrumbs={[{ label: 'Projects', to: '/projects' }, { label: projectName || 'Project', to: `/project/${projectId}/board` }, { label: 'Snippets' }]}>
      <div className="h-full flex gap-6 overflow-hidden">
        <div className="w-80 flex flex-col gap-4">
          <div className="flex items-center justify-between"><h1 className="text-xl font-bold">Snippets</h1><Button size="sm" className="px-2" onClick={saveSnippet} disabled={saving}><Plus size={16} /></Button></div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input placeholder="Search by title or tag..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-black/10 dark:bg-white/5 border border-dark-border rounded-lg pl-9 pr-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div className="surface rounded-xl border p-3 space-y-2">
            {saveError && <p className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-2 py-1">{saveError}</p>}
            <Input placeholder="Title" value={draft.title} onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))} />
            <select className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-xs" value={draft.language} onChange={(e) => setDraft((p) => ({ ...p, language: e.target.value }))}>
              {['javascript','typescript','python','java','cpp','go','rust','html','css','sql'].map((lang) => <option key={lang}>{lang}</option>)}
            </select>
            <textarea placeholder="Code" value={draft.code} onChange={(e) => setDraft((p) => ({ ...p, code: e.target.value }))} className="w-full h-24 bg-black/10 dark:bg-white/5 border border-dark-border rounded-lg p-2 text-xs font-mono" />
            <textarea placeholder="Description" value={draft.description} onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))} className="w-full h-16 bg-black/10 dark:bg-white/5 border border-dark-border rounded-lg p-2 text-xs" />
            <Input placeholder="Tags comma separated" value={draft.tags} onChange={(e) => setDraft((p) => ({ ...p, tags: e.target.value }))} />
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {filteredSnippets.map((s) => (
              <button key={s._id || s.id} onClick={() => setSelectedId(s._id || s.id)} className={cn("p-3 rounded-xl border transition-all cursor-pointer group w-full text-left", selectedId === (s._id || s.id) ? "bg-primary/10 border-primary" : "surface border-transparent hover:border-dark-border")}>
                <div className="flex items-center justify-between mb-1"><Badge variant="info" className="text-[8px] px-1 py-0">{s.language}</Badge></div>
                <h3 className="font-bold text-sm truncate">{s.title}</h3><p className="text-[10px] text-gray-500 truncate mt-1">{s.description}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 surface rounded-2xl flex flex-col overflow-hidden border">
          {selectedSnippet ? (
            <>
              <div className="p-6 border-b dark:border-dark-border flex items-center justify-between bg-white/1">
                <div><h2 className="text-2xl font-bold">{selectedSnippet.title}</h2><div className="flex items-center gap-2 mt-2"><Avatar src={selectedSnippet.createdBy?.avatar || user?.avatar} size="xs" /><span className="text-xs text-gray-500">Shared by {selectedSnippet.createdBy?.name || user?.name}</span></div></div>
                <div className="flex gap-2"><Button variant="ghost" size="sm" onClick={deleteSnippet} className="text-gray-500 hover:text-danger"><Trash2 size={16} /></Button></div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="relative group"><button onClick={handleCopy} className="absolute top-4 right-4 bg-dark-bg/80 border border-dark-border p-2 rounded-lg z-10">{isCopied ? <Check size={16} className="text-success" /> : <Copy size={16} />}</button><div className="bg-[#0D0D0E] rounded-xl p-6 text-sm overflow-x-auto border border-dark-border"><pre><code ref={codeRef} className="hljs">{selectedSnippet.code}</code></pre></div></div>
                <p className="text-gray-400 text-sm">{selectedSnippet.description}</p>
                <div className="flex flex-wrap gap-2">{selectedSnippet.tags?.map((tag) => <span key={tag} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs">#{tag}</span>)}</div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4"><FileCode size={32} className="text-gray-500" /><h3 className="text-xl font-bold">No snippet selected</h3></div>
          )}
        </div>
      </div>
      {toast && (
        <div className="fixed bottom-6 right-6 bg-red-500/90 text-white text-xs px-4 py-2 rounded-lg shadow-lg">
          {toast}
        </div>
      )}
    </PageShell>
  );
};

export default SnippetsPage;
