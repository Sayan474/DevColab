import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { PageShell } from '../../components/layout/PageShell';
import { Button, Avatar, Input, Modal } from '../../components/ui';
import { cn } from '../../assets/utils';
import { 
  Plus, ChevronRight, FileText, Clock, History, 
  Bold, Italic, Type, List, Code, Link2, 
  Image as ImageIcon, ChevronLeft, X, Trash2
} from 'lucide-react';
import api, { unwrap } from '../../lib/api';
import { useAuth } from '../../context/useAuth';
import { timeAgo } from '../../lib/format';

// TipTap imports
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';

// Extend TextStyle to support font size attributes
const FontSize = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: element => element.style.fontSize,
        renderHTML: attributes => {
          if (!attributes.fontSize) {
            return {};
          }
          return { style: `font-size: ${attributes.fontSize}` };
        },
      },
    };
  },
  addCommands() {
    return {
      setFontSize: fontSize => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize })
          .run();
      },
      unsetFontSize: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .run();
      },
    };
  },
});

const WikiPage = () => {
  const { id: projectId } = useParams();
  const { user } = useAuth();
  const [projectName, setProjectName] = useState('');
  const [pages, setPages] = useState([]);
  const [selectedPageId, setSelectedPageId] = useState(null);
  const [selectedPage, setSelectedPage] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [saveState, setSaveState] = useState('Saved');
  const [showHistory, setShowHistory] = useState(false);
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(true);
  const [previewHtml, setPreviewHtml] = useState('');
  const autoSaveTimerRef = useRef(null);

  // Custom Modal States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [pageToDeleteId, setPageToDeleteId] = useState(null);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrlInput, setLinkUrlInput] = useState('');
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Custom Dropdown States
  const [fontFamilyDropdownOpen, setFontFamilyDropdownOpen] = useState(false);
  const [fontSizeDropdownOpen, setFontSizeDropdownOpen] = useState(false);

  // TipTap Editor Initialization
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Image,
      TextStyle,
      FontFamily,
      FontSize,
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert focus:outline-none min-h-[420px] max-w-none text-gray-100 p-2',
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            event.preventDefault();
            const reader = new FileReader();
            reader.onload = (readerEvent) => {
              const base64 = readerEvent.target.result;
              const { schema } = view.state;
              const node = schema.nodes.image.create({ src: base64 });
              const transaction = view.state.tr.replaceSelectionWith(node);
              view.dispatch(transaction);

              // Instantly update local state so save events capture the new image
              setTimeout(() => {
                const html = view.state.doc.textContent ? view.dom.innerHTML : '';
                // Or simply editor.getHTML()
                if (editor) {
                  const updatedHtml = editor.getHTML();
                  setSelectedPage((prev) => prev ? { ...prev, content: updatedHtml } : prev);
                  setPreviewHtml(updatedHtml);
                }
              }, 50);
            };
            reader.readAsDataURL(file);
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event, slice) => {
        if (event.clipboardData && event.clipboardData.files && event.clipboardData.files[0]) {
          const file = event.clipboardData.files[0];
          if (file.type.startsWith('image/')) {
            event.preventDefault();
            const reader = new FileReader();
            reader.onload = (readerEvent) => {
              const base64 = readerEvent.target.result;
              const { schema } = view.state;
              const node = schema.nodes.image.create({ src: base64 });
              const transaction = view.state.tr.replaceSelectionWith(node);
              view.dispatch(transaction);

              // Instantly update local state so save events capture the new image
              setTimeout(() => {
                if (editor) {
                  const updatedHtml = editor.getHTML();
                  setSelectedPage((prev) => prev ? { ...prev, content: updatedHtml } : prev);
                  setPreviewHtml(updatedHtml);
                }
              }, 50);
            };
            reader.readAsDataURL(file);
            return true;
          }
        }
        return false;
      }
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setPreviewHtml(html);
    },
  });

  const loadPages = async () => {
    try {
      const data = unwrap(await api.get(`/wiki/project/${projectId}`));
      setPages(data || []);
      setSelectedPageId((prev) => prev || data?.[0]?.id || data?.[0]?._id || null);
    } catch (err) {
      console.error("Failed to load wiki pages:", err);
    }
  };

  useEffect(() => { loadPages(); }, [projectId]);

  // Load single page details when selectedPageId changes
  useEffect(() => {
    if (!selectedPageId) return;
    api.get(`/wiki/${selectedPageId}`).then((res) => {
      const page = unwrap(res);
      setSelectedPage(page || null);
      setPreviewHtml(page?.content || '');
      if (editor && page) {
        // Sync editor content only if it differs to prevent losing cursor position
        if (editor.getHTML() !== page.content) {
          editor.commands.setContent(page.content || '');
        }
      }
    }).catch((err) => {
      console.error("Failed to load wiki page:", err);
    });
  }, [selectedPageId, editor]);

  useEffect(() => {
    if (!projectId) return;
    api.get(`/projects/${projectId}`)
      .then((res) => setProjectName(unwrap(res).project?.name || ''))
      .catch(() => {});
  }, [projectId]);

  // Auto-save effect using ref timer and previewHtml
  useEffect(() => {
    if (!selectedPage || !isAutoSaveEnabled) return;
    
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(async () => {
      setSaveState('Saving...');
      try {
        const latestContent = editor ? editor.getHTML() : previewHtml;
        const data = unwrap(await api.put(`/wiki/${selectedPage._id || selectedPage.id}`, { 
          title: selectedPage.title, 
          content: latestContent,
          projectId: projectId
        }));
        
        setSelectedPage((prev) => {
          if (!prev || (prev._id || prev.id) !== (data._id || data.id)) return prev;
          return {
            ...prev,
            content: latestContent,
            updatedAt: data.updatedAt, 
            updatedBy: data.updatedBy,
            versionHistory: data.versionHistory 
          };
        });
        
        setPages((prev) => prev.map((p) => (p._id || p.id) === (selectedPage._id || selectedPage.id) ? { ...p, title: selectedPage.title } : p));
        setSaveState('Saved');
      } catch (err) {
        console.error("Failed to auto-save:", err);
        setSaveState('Error');
      }
    }, 2000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [selectedPage?.title, previewHtml, projectId, isAutoSaveEnabled]);

  const createPage = async () => {
    const title = draftTitle.trim() || 'Untitled Page';
    try {
      const data = unwrap(await api.post('/wiki', { 
        projectId, 
        title, 
        content: `<h1>${title}</h1><p>Start writing your documentation here.</p>` 
      }));
      setDraftTitle('');
      setPages((prev) => [...prev, data]);
      setSelectedPageId(data._id || data.id);
    } catch (err) {
      console.error("Failed to create wiki page:", err);
    }
  };

  const saveNow = async () => {
    if (!selectedPage) return;
    try {
      setSaveState('Saving...');
      const latestContent = editor ? editor.getHTML() : previewHtml;
      const data = unwrap(await api.put(`/wiki/${selectedPage._id || selectedPage.id}`, { 
        title: selectedPage.title, 
        content: latestContent,
        projectId: projectId
      }));
      setSelectedPage((prev) => {
        if (!prev || (prev._id || prev.id) !== (data._id || data.id)) return prev;
        return { 
          ...prev, 
          content: latestContent,
          updatedAt: data.updatedAt, 
          updatedBy: data.updatedBy,
          versionHistory: data.versionHistory 
        };
      });
      setPages((prev) => prev.map((p) => (p._id || p.id) === (selectedPage._id || selectedPage.id) ? { ...p, title: selectedPage.title } : p));
      setSaveState('Saved');
    } catch (err) {
      console.error("Failed to save wiki page:", err);
      setSaveState('Error');
    }
  };

  // Save current page immediately before switching pages
  const handlePageSwitch = async (nextPageId) => {
    if (nextPageId === selectedPageId) return;
    
    // Clear auto-save timer immediately on page switch to prevent old page saving in background
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }

    if (selectedPage) {
      setSaveState('Saving...');
      try {
        const latestContent = editor ? editor.getHTML() : previewHtml;
        await api.put(`/wiki/${selectedPage._id || selectedPage.id}`, { 
          title: selectedPage.title, 
          content: latestContent,
          projectId: projectId
        });
      } catch (err) {
        console.error("Failed to save page before switching:", err);
      }
    }
    setSelectedPageId(nextPageId);
  };

  const triggerDeletePage = (pageId) => {
    setPageToDeleteId(pageId);
    setDeleteModalOpen(true);
  };

  const confirmDeletePage = async () => {
    if (!pageToDeleteId) return;
    try {
      await api.delete(`/wiki/${pageToDeleteId}`);
      const remainingPages = pages.filter((p) => {
        const pId = p.id || p._id;
        return pId !== pageToDeleteId;
      });
      setPages(remainingPages);
      if (selectedPageId === pageToDeleteId) {
        const nextSelected = remainingPages[0]?.id || remainingPages[0]?._id || null;
        setSelectedPageId(nextSelected);
        if (!nextSelected) {
          setSelectedPage(null);
          editor?.commands.setContent('');
        }
      }
      setDeleteModalOpen(false);
      setPageToDeleteId(null);
    } catch (err) {
      console.error("Failed to delete page:", err);
      alert("Failed to delete page: " + (err.response?.data?.message || err.message));
    }
  };

  // Editor toolbar command handlers
  const executeCommand = (action, val) => {
    if (!editor) return;
    if (action === 'bold') {
      editor.chain().focus().toggleBold().run();
    } else if (action === 'italic') {
      editor.chain().focus().toggleItalic().run();
    } else if (action === 'insertUnorderedList') {
      editor.chain().focus().toggleBulletList().run();
    } else if (action === 'formatBlock') {
      if (val === 'H1') {
        editor.chain().focus().toggleHeading({ level: 1 }).run();
      } else if (val === 'PRE') {
        editor.chain().focus().toggleCodeBlock().run();
      }
    }
  };

  const openLinkModal = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    setLinkUrlInput(previousUrl || '');
    setLinkModalOpen(true);
  };

  const confirmInsertLink = async () => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const isSame = from === to;
    
    if (linkUrlInput === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      if (isSame) {
        editor.chain().focus().insertContent(`<a href="${linkUrlInput}">${linkUrlInput}</a>`).run();
      } else {
        editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrlInput }).run();
      }
    }
    
    const updatedHtml = editor.getHTML();
    setLinkModalOpen(false);
    setLinkUrlInput('');

    // Save immediately
    if (selectedPage) {
      setSaveState('Saving...');
      try {
        const data = unwrap(await api.put(`/wiki/${selectedPage._id || selectedPage.id}`, { 
          title: selectedPage.title, 
          content: updatedHtml,
          projectId: projectId
        }));
        setSelectedPage((prev) => prev ? { 
          ...prev, 
          content: updatedHtml,
          updatedAt: data.updatedAt, 
          updatedBy: data.updatedBy,
          versionHistory: data.versionHistory 
        } : prev);
        setPreviewHtml(updatedHtml);
        setSaveState('Saved');
      } catch (err) {
        console.error("Failed to save after link insertion:", err);
      }
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        setImagePreview(readerEvent.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const openImageModal = () => {
    setImageFile(null);
    setImagePreview('');
    setImageModalOpen(true);
  };

  const confirmInsertImage = async () => {
    if (!editor || !imagePreview) return;
    editor.chain().focus().setImage({ src: imagePreview }).run();
    
    const updatedHtml = editor.getHTML();
    setImageModalOpen(false);
    setImageFile(null);
    setImagePreview('');

    // Save immediately
    if (selectedPage) {
      setSaveState('Saving...');
      try {
        const data = unwrap(await api.put(`/wiki/${selectedPage._id || selectedPage.id}`, { 
          title: selectedPage.title, 
          content: updatedHtml,
          projectId: projectId
        }));
        setSelectedPage((prev) => prev ? { 
          ...prev, 
          content: updatedHtml,
          updatedAt: data.updatedAt, 
          updatedBy: data.updatedBy,
          versionHistory: data.versionHistory 
        } : prev);
        setPreviewHtml(updatedHtml);
        setSaveState('Saved');
      } catch (err) {
        console.error("Failed to save after image insertion:", err);
      }
    }
  };

  const restoreVersion = (version) => {
    if (!editor) return;
    editor.commands.setContent(version.content || '');
    setSelectedPage((prev) => prev ? { ...prev, title: version.title, content: version.content } : prev);
    setPreviewHtml(version.content || '');
    setShowHistory(false);
  };

  return (
    <PageShell breadcrumbs={[{ label: 'Projects', to: '/projects' }, { label: projectName || 'Project', to: `/project/${projectId}/board` }, { label: 'Wiki' }]}>
      <div className="h-full flex gap-0 -mx-6 -my-6 overflow-hidden relative">
        <div className={cn("surface border-r transition-all duration-300 flex flex-col", isSidebarCollapsed ? "w-0" : "w-72")}>
          <div className="p-4 border-b flex items-center gap-2 whitespace-nowrap">
            <Input placeholder="New page" value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} />
            <button onClick={createPage} className="text-gray-500 hover:text-white"><Plus size={16} /></button>
          </div>
          <div className="p-4 space-y-1 overflow-y-auto">
            {pages?.map((page) => {
              const isSelected = selectedPageId === (page?._id || page?.id);
              return (
                <div 
                  key={page?._id || page?.id} 
                  className={cn(
                    "flex items-center justify-between w-full px-3 py-1 rounded-lg text-sm transition-all group",
                    isSelected ? "bg-primary/10 text-primary font-bold" : "text-gray-500 hover:bg-white/5"
                  )}
                >
                  <button 
                    onClick={() => handlePageSwitch(page?.id || page?._id)} 
                    className="flex items-center gap-2 flex-1 text-left py-1 overflow-hidden"
                  >
                    <FileText size={16} className="shrink-0" />
                    <span className="truncate">{page?.title || "Untitled Page"}</span>
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerDeletePage(page?.id || page?._id);
                    }} 
                    className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-danger p-1 rounded transition-opacity shrink-0 cursor-pointer"
                    title="Delete page"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex-1 flex flex-col bg-dark-bg relative">
          <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-dark-border p-1 rounded-r-lg hover:text-primary">
            {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
          
          <div className="surface border-b px-6 py-2 flex items-center justify-between sticky top-0 z-10 bg-dark-bg/80 backdrop-blur-md">
            
            {/* Connected Toolbar Buttons with Active Toggle Indications */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button 
                type="button"
                onMouseDown={(e) => { e.preventDefault(); executeCommand('formatBlock', 'H1'); }}
                variant="ghost" 
                size="sm" 
                className={cn("w-8 h-8 p-0 transition-colors cursor-pointer", editor?.isActive('heading', { level: 1 }) ? "bg-primary/20 text-primary hover:bg-primary/30" : "text-gray-400 hover:text-white")} 
                title="Heading"
              >
                <Type size={16} />
              </Button>
              <Button 
                type="button"
                onMouseDown={(e) => { e.preventDefault(); executeCommand('bold'); }}
                variant="ghost" 
                size="sm" 
                className={cn("w-8 h-8 p-0 transition-colors cursor-pointer", editor?.isActive('bold') ? "bg-primary/20 text-primary hover:bg-primary/30" : "text-gray-400 hover:text-white")} 
                title="Bold"
              >
                <Bold size={16} />
              </Button>
              <Button 
                type="button"
                onMouseDown={(e) => { e.preventDefault(); executeCommand('italic'); }}
                variant="ghost" 
                size="sm" 
                className={cn("w-8 h-8 p-0 transition-colors cursor-pointer", editor?.isActive('italic') ? "bg-primary/20 text-primary hover:bg-primary/30" : "text-gray-400 hover:text-white")} 
                title="Italic"
              >
                <Italic size={16} />
              </Button>
              <Button 
                type="button"
                onMouseDown={(e) => { e.preventDefault(); executeCommand('insertUnorderedList'); }}
                variant="ghost" 
                size="sm" 
                className={cn("w-8 h-8 p-0 transition-colors cursor-pointer", editor?.isActive('bulletList') ? "bg-primary/20 text-primary hover:bg-primary/30" : "text-gray-400 hover:text-white")} 
                title="Bullet List"
              >
                <List size={16} />
              </Button>
              <Button 
                type="button"
                onMouseDown={(e) => { e.preventDefault(); executeCommand('formatBlock', 'PRE'); }}
                variant="ghost" 
                size="sm" 
                className={cn("w-8 h-8 p-0 transition-colors cursor-pointer", editor?.isActive('codeBlock') ? "bg-primary/20 text-primary hover:bg-primary/30" : "text-gray-400 hover:text-white")} 
                title="Code Block"
              >
                <Code size={16} />
              </Button>
              <Button 
                type="button"
                onMouseDown={(e) => { e.preventDefault(); openLinkModal(); }}
                variant="ghost" 
                size="sm" 
                className={cn("w-8 h-8 p-0 transition-colors cursor-pointer", editor?.isActive('link') ? "bg-primary/20 text-primary hover:bg-primary/30" : "text-gray-400 hover:text-white")} 
                title="Link"
              >
                <Link2 size={16} />
              </Button>
              <Button 
                type="button"
                onMouseDown={(e) => { e.preventDefault(); openImageModal(); }}
                variant="ghost" 
                size="sm" 
                className="w-8 h-8 p-0 text-gray-400 hover:text-white transition-colors cursor-pointer" 
                title="Image"
              >
                <ImageIcon size={16} />
              </Button>

              <div className="h-6 w-[1px] bg-dark-border mx-1" />

              {/* Custom Font Family Selector */}
              {(() => {
                const fontFamilies = [
                  { label: 'Default Font', value: 'default' },
                  { label: 'Inter (Sans)', value: 'Inter' },
                  { label: 'Georgia (Serif)', value: 'Georgia' },
                  { label: 'Courier New', value: 'Courier New' },
                  { label: 'Comic Sans', value: 'Comic Sans MS' },
                  { label: 'Impact', value: 'Impact' },
                ];
                const activeFont = editor?.getAttributes('textStyle').fontFamily;
                const activeLabel = fontFamilies.find(f => f.value === activeFont)?.label || 'Font Style';

                return (
                  <div className="relative">
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setFontFamilyDropdownOpen(!fontFamilyDropdownOpen);
                        setFontSizeDropdownOpen(false);
                      }}
                      className="bg-dark-border border border-white/10 text-gray-300 text-xs rounded px-2.5 py-1.5 outline-none h-8 cursor-pointer hover:border-primary/50 flex items-center gap-1.5 min-w-[100px] justify-between transition-colors"
                    >
                      <span className="truncate">{activeLabel}</span>
                      <ChevronRight size={12} className={cn("transition-transform shrink-0", fontFamilyDropdownOpen ? "-rotate-90" : "rotate-90")} />
                    </button>
                    {fontFamilyDropdownOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setFontFamilyDropdownOpen(false);
                          }}
                        />
                        <div className="absolute left-0 mt-1 w-44 rounded-lg shadow-xl bg-dark-bg/95 border border-white/10 backdrop-blur-md z-50 py-1.5 max-h-60 overflow-y-auto">
                          {fontFamilies.map((font) => (
                            <button
                              key={font.value}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                if (font.value === 'default') {
                                  editor?.chain().focus().unsetFontFamily().run();
                                } else {
                                  editor?.chain().focus().setFontFamily(font.value).run();
                                }
                                setFontFamilyDropdownOpen(false);
                              }}
                              className={cn(
                                "w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-primary/20 hover:text-white transition-colors cursor-pointer block",
                                (activeFont === font.value || (!activeFont && font.value === 'default')) && "bg-primary/10 text-primary font-semibold"
                              )}
                            >
                              {font.label}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}

              {/* Custom Font Size Selector */}
              {(() => {
                const fontSizes = [
                  { label: 'Default Size', value: 'default' },
                  { label: '12px', value: '12px' },
                  { label: '14px', value: '14px' },
                  { label: '16px', value: '16px' },
                  { label: '18px', value: '18px' },
                  { label: '20px', value: '20px' },
                  { label: '24px', value: '24px' },
                  { label: '30px', value: '30px' },
                  { label: '36px', value: '36px' },
                ];
                const activeSize = editor?.getAttributes('textStyle').fontSize;
                const activeLabel = fontSizes.find(s => s.value === activeSize)?.label || 'Font Size';

                return (
                  <div className="relative">
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setFontSizeDropdownOpen(!fontSizeDropdownOpen);
                        setFontFamilyDropdownOpen(false);
                      }}
                      className="bg-dark-border border border-white/10 text-gray-300 text-xs rounded px-2.5 py-1.5 outline-none h-8 cursor-pointer hover:border-primary/50 flex items-center gap-1.5 min-w-[90px] justify-between transition-colors"
                    >
                      <span className="truncate">{activeLabel}</span>
                      <ChevronRight size={12} className={cn("transition-transform shrink-0", fontSizeDropdownOpen ? "-rotate-90" : "rotate-90")} />
                    </button>
                    {fontSizeDropdownOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setFontSizeDropdownOpen(false);
                          }}
                        />
                        <div className="absolute left-0 mt-1 w-32 rounded-lg shadow-xl bg-dark-bg/95 border border-white/10 backdrop-blur-md z-50 py-1.5 max-h-60 overflow-y-auto">
                          {fontSizes.map((size) => (
                            <button
                              key={size.value}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                if (size.value === 'default') {
                                  editor?.chain().focus().unsetFontSize().run();
                                } else {
                                  editor?.chain().focus().setFontSize(size.value).run();
                                }
                                setFontSizeDropdownOpen(false);
                              }}
                              className={cn(
                                "w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-primary/20 hover:text-white transition-colors cursor-pointer block",
                                (activeSize === size.value || (!activeSize && size.value === 'default')) && "bg-primary/10 text-primary font-semibold"
                              )}
                            >
                              {size.label}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}
            </div>

            <div className="flex items-center gap-4">
              {/* Custom Auto Save Checkbox */}
              <div className="flex items-center gap-2 select-none">
                <div
                  onMouseDown={(e) => { e.preventDefault(); setIsAutoSaveEnabled(!isAutoSaveEnabled); }}
                  className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-all shrink-0",
                    isAutoSaveEnabled 
                      ? "bg-primary border-primary text-white" 
                      : "border-white/20 bg-white/5 hover:border-white/40"
                  )}
                >
                  {isAutoSaveEnabled && (
                    <svg 
                      className="w-3 h-3 stroke-white" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      strokeWidth="4"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M4.5 12.75l6 6 9-13.5" 
                      />
                    </svg>
                  )}
                </div>
                <span 
                  onMouseDown={(e) => { e.preventDefault(); setIsAutoSaveEnabled(!isAutoSaveEnabled); }}
                  className="text-[10px] text-gray-400 uppercase tracking-widest font-bold cursor-pointer"
                >
                  Auto Save
                </span>
              </div>

              <span className={cn(
                "text-[10px] flex items-center gap-1 font-bold uppercase tracking-widest",
                saveState === 'Error' ? "text-danger animate-pulse" : "text-gray-500"
              )}>
                <Clock size={12} /> {saveState}
              </span>
              <Button type="button" size="sm" variant="secondary" onMouseDown={(e) => { e.preventDefault(); setShowHistory(!showHistory); }} className={cn("toggle-button gap-2 transition-colors cursor-pointer", showHistory && "bg-primary/10 text-primary border-primary")}>
                <History size={14} /> History
              </Button>
              <Button type="button" size="sm" onClick={saveNow} className="cursor-pointer">Save</Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-12 max-w-6xl mx-auto w-full animate-fade-in">
            {selectedPage ? (
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Avatar src={selectedPage.createdBy?.avatar || user?.avatar} size="xs" />
                    <span>Last edited {timeAgo(selectedPage.updatedAt)}</span>
                  </div>
                  <input 
                    className="text-5xl font-bold bg-transparent border-none outline-none w-full text-gray-100" 
                    value={selectedPage.title || ''} 
                    onChange={(e) => setSelectedPage((prev) => ({ ...prev, title: e.target.value }))} 
                  />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Resizable Text Editor Container */}
                  <div className="surface rounded-2xl p-4 space-y-3 border flex flex-col">
                    <div className="flex items-center justify-between border-b dark:border-dark-border pb-3">
                      <div>
                        <p className="text-sm font-semibold">Rich Text Editor</p>
                      </div>
                      <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">TipTap Canvas</span>
                    </div>
                    {/* Enlargement resize handle via overflow-auto & resize-y CSS */}
                    <div className="input-field min-h-[420px] border rounded-lg focus-within:ring-2 focus-within:ring-primary/50 overflow-auto resize-y">
                      <EditorContent editor={editor} />
                    </div>
                  </div>
                  {/* Exact Live HTML Preview Container */}
                  <div className="surface rounded-2xl p-4 border flex flex-col">
                    <div className="flex items-center justify-between border-b dark:border-dark-border pb-3 mb-4">
                      <div>
                        <p className="text-sm font-semibold">Live Preview</p>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      <div 
                        className="preview-container prose prose-sm dark:prose-invert max-w-none text-gray-100 p-2"
                        dangerouslySetInnerHTML={{ __html: previewHtml || '' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <h3 className="text-xl font-bold">Create a page</h3>
                <p className="text-gray-500">Add a wiki page from the sidebar.</p>
              </div>
            )}
          </div>
        </div>

        {/* Beautiful Right Drawer / Version History Panel */}
        {showHistory && (
          <div className="absolute right-0 top-0 bottom-0 w-80 surface border-l z-30 shadow-2xl flex flex-col animate-slide-in">
            <div className="p-4 border-b flex items-center justify-between">
              <span className="font-bold text-sm flex items-center gap-2">
                <History size={16} /> Version History
              </span>
              <button onClick={() => setShowHistory(false)} className="text-gray-500 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {(!selectedPage?.versionHistory || selectedPage.versionHistory.length === 0) ? (
                <div className="text-center py-8 text-xs text-gray-500">
                  No previous versions recorded.
                </div>
              ) : (
                selectedPage.versionHistory.slice(-5).reverse().map((version, index) => (
                  <div key={version._id || index} className="p-3 border rounded-xl dark:bg-dark-bg/40 space-y-2 hover:border-primary/50 transition-all text-xs">
                    <div className="flex justify-between items-center text-gray-400">
                      <span className="font-semibold">{timeAgo(version.editedAt)}</span>
                      <span>v{selectedPage.versionHistory.length - index}</span>
                    </div>
                    <p className="font-medium text-gray-200">{version.title}</p>
                    <p className="text-gray-500 italic">"{version.changeSummary || 'Updated content'}"</p>
                    <Button 
                      type="button"
                      size="xs" 
                      variant="secondary" 
                      className="w-full text-center mt-1 cursor-pointer" 
                      onClick={() => restoreVersion(version)}
                    >
                      Restore Version
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Custom Deletion Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Wiki Page"
        footer={
          <div className="flex justify-end gap-3 mt-4">
            <Button type="button" variant="secondary" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="danger" onClick={confirmDeletePage}>
              Delete
            </Button>
          </div>
        }
      >
        <p className="text-sm text-gray-300">
          Are you sure you want to permanently delete this wiki page? This action cannot be undone.
        </p>
      </Modal>

      {/* Custom Link Insertion Modal */}
      <Modal
        isOpen={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        title="Insert Link"
        footer={
          <div className="flex justify-end gap-3 mt-4">
            <Button type="button" variant="secondary" onClick={() => setLinkModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={confirmInsertLink}>
              Insert
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="URL Address"
            placeholder="https://example.com"
            value={linkUrlInput}
            onChange={(e) => setLinkUrlInput(e.target.value)}
            className="bg-white/5 border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all text-white"
          />
        </div>
      </Modal>

      {/* Custom Image Insertion Modal */}
      <Modal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        title="Upload Image"
        footer={
          <div className="flex justify-end gap-3 mt-4">
            <Button type="button" variant="secondary" onClick={() => setImageModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={confirmInsertImage} disabled={!imagePreview}>
              Insert
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center border border-dashed border-white/20 hover:border-primary/50 rounded-lg p-6 bg-white/5 transition-colors cursor-pointer relative group min-h-[160px]">
            <input 
              type="file" 
              accept="image/*"
              onChange={handleImageFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            {imagePreview ? (
              <div className="flex flex-col items-center gap-2 z-20">
                <img src={imagePreview} alt="Preview" className="max-h-40 rounded object-contain border border-white/10" />
                <span className="text-xs text-gray-400 truncate max-w-[200px]">{imageFile?.name}</span>
                <span className="text-[10px] text-primary group-hover:underline">Click to change image</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center pointer-events-none">
                <Plus size={24} className="text-gray-400 group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium text-gray-300">Choose an image from device</span>
                <span className="text-xs text-gray-500">Supports PNG, JPG, GIF, WebP</span>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </PageShell>
  );
};

export default WikiPage;