import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageShell } from '../../components/layout/PageShell';
import { Button, Avatar, Input } from '../../components/ui';
import { cn } from '../../assets/utils';
import { Plus, ChevronRight, FileText, Clock, History, Bold, Italic, Type, List, Code, Link2, Image as ImageIcon, ChevronLeft } from 'lucide-react';
import api, { unwrap } from '../../lib/api';
import { useAuth } from '../../context/useAuth';
import { timeAgo } from '../../lib/format';

const WikiPage = () => {
  const { id: projectId } = useParams();
  const { user } = useAuth();
  const [pages, setPages] = useState([]);
  const [selectedPageId, setSelectedPageId] = useState(null);
  const [selectedPage, setSelectedPage] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [saveState, setSaveState] = useState('Saved');
  const contentRef = useRef(null);

  const loadPages = async () => {
    const data = unwrap(await api.get(`/wiki/project/${projectId}`));
    setPages(data.pages || []);
    setSelectedPageId((prev) => prev || data.pages?.[0]?._id || null);
  };

  useEffect(() => { loadPages().catch(() => {}); }, [projectId]);
  useEffect(() => {
    if (!selectedPageId) return;
    api.get(`/wiki/${selectedPageId}`).then((res) => setSelectedPage(unwrap(res).page)).catch(() => {});
  }, [selectedPageId]);

  useEffect(() => {
    if (!selectedPage) return;
    const timer = setTimeout(async () => {
      const content = contentRef.current?.innerHTML || selectedPage.content || '';
      setSaveState('Saving...');
      const data = unwrap(await api.put(`/wiki/${selectedPage._id || selectedPage.id}`, { title: selectedPage.title, content }));
      setSelectedPage(data.page);
      setSaveState('Saved');
    }, 2000);
    return () => clearTimeout(timer);
  }, [selectedPage?.title, selectedPage?.content]);

  const createPage = async () => {
    const title = draftTitle.trim() || 'Untitled Page';
    const data = unwrap(await api.post('/wiki', { projectId, title, content: `<p>${title}</p>` }));
    setDraftTitle('');
    setPages((prev) => [...prev, data.page]);
    setSelectedPageId(data.page._id);
  };

  const saveNow = async () => {
    if (!selectedPage) return;
    const data = unwrap(await api.put(`/wiki/${selectedPage._id || selectedPage.id}`, { title: selectedPage.title, content: contentRef.current?.innerHTML || '' }));
    setSelectedPage(data.page);
    setSaveState('Saved');
  };

  return (
    <PageShell breadcrumbs={['Projects', 'Wiki']}>
      <div className="h-full flex gap-0 -mx-6 -my-6 overflow-hidden">
        <div className={cn("surface border-r transition-all duration-300 flex flex-col", isSidebarCollapsed ? "w-0" : "w-72")}>
          <div className="p-4 border-b flex items-center gap-2 whitespace-nowrap">
            <Input placeholder="New page" value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} />
            <button onClick={createPage} className="text-gray-500 hover:text-white"><Plus size={16} /></button>
          </div>
          <div className="p-4 space-y-1">
            {pages.map((page) => (
              <button key={page._id || page.id} onClick={() => setSelectedPageId(page._id || page.id)} className={cn("flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-all whitespace-nowrap", selectedPageId === (page._id || page.id) ? "bg-primary/10 text-primary font-bold" : "text-gray-500 hover:bg-white/5")}>
                <FileText size={16} /> {page.title}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col bg-dark-bg relative">
          <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-dark-border p-1 rounded-r-lg hover:text-primary">
            {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
          <div className="surface border-b px-6 py-2 flex items-center justify-between sticky top-0 z-10 bg-dark-bg/80 backdrop-blur-md">
            <div className="flex items-center gap-1">
              {[Type, Bold, Italic, List, Code, Link2, ImageIcon].map((Icon, index) => <Button key={index} variant="ghost" size="sm" className="w-8 h-8 p-0"><Icon size={16} /></Button>)}
            </div>
            <div className="flex items-center gap-4"><span className="text-[10px] text-gray-500 flex items-center gap-1 font-bold uppercase tracking-widest"><Clock size={12} /> {saveState}</span><Button size="sm" variant="secondary" className="gap-2"><History size={14} /> History</Button><Button size="sm" onClick={saveNow}>Save</Button></div>
          </div>
          <div className="flex-1 overflow-y-auto p-12 max-w-4xl mx-auto w-full animate-fade-in">
            {selectedPage ? (
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500"><Avatar src={selectedPage.createdBy?.avatar || user?.avatar} size="xs" /><span>Last edited {timeAgo(selectedPage.updatedAt)}</span></div>
                  <input className="text-5xl font-bold bg-transparent border-none outline-none w-full text-gray-100" value={selectedPage.title} onChange={(e) => setSelectedPage((prev) => ({ ...prev, title: e.target.value }))} />
                </div>
                <div ref={contentRef} className="prose prose-invert max-w-none text-gray-300 leading-relaxed text-lg min-h-[300px]" contentEditable suppressContentEditableWarning dangerouslySetInnerHTML={{ __html: selectedPage.content || '<p>Start typing here...</p>' }} />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4"><h3 className="text-xl font-bold">Create a page</h3><p className="text-gray-500">Add a wiki page from the sidebar.</p></div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default WikiPage;
