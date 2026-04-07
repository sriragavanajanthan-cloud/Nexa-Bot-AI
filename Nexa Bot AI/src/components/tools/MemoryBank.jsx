import { useState, useEffect, useRef } from "react";
import { invokeLLM } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Brain, Search, Plus, Trash2, Edit2, Save, X, 
  FolderOpen, MessageSquare, Sparkles, Tag, 
  Clock, ChevronRight, ChevronDown, Download, Upload,
  Star, Link2, ExternalLink, Copy, Check
} from "lucide-react";

// Categories
const CATEGORIES = [
  { id: "work", name: "💼 Work", color: "bg-blue-500/20 text-blue-400" },
  { id: "personal", name: "🏠 Personal", color: "bg-green-500/20 text-green-400" },
  { id: "coding", name: "💻 Coding", color: "bg-cyan-500/20 text-cyan-400" },
  { id: "learning", name: "📚 Learning", color: "bg-yellow-500/20 text-yellow-400" },
  { id: "other", name: "📁 Other", color: "bg-gray-500/20 text-gray-400" },
];

export default function MemoryBank() {
  const [memories, setMemories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  
  const scrollRef = useRef(null);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState("other");
  const [formTags, setFormTags] = useState("");
  const [formImportance, setFormImportance] = useState(3);
  const [formLinks, setFormLinks] = useState([]);
  const [newLink, setNewLink] = useState("");

  // Load & Save
  useEffect(() => {
    const saved = localStorage.getItem("nexabot_memories");
    if (saved) setMemories(JSON.parse(saved));
    else setMemories(SAMPLE_MEMORIES);
  }, []);

  useEffect(() => {
    if (memories.length) localStorage.setItem("nexabot_memories", JSON.stringify(memories));
  }, [memories]);

  // AI Functions
  const aiDescribe = async () => {
    if (!formTitle) return;
    setLoading(true);
    const prompt = `Write a short description (1 sentence) for a chat titled: "${formTitle}"`;
    const result = await invokeLLM({ prompt });
    if (result) setFormDescription(result);
    setLoading(false);
  };

  const aiSuggestTags = async () => {
    if (!formTitle && !formDescription) return;
    setLoading(true);
    const text = `${formTitle} ${formDescription}`;
    const prompt = `Suggest 3 tags for: "${text}". Return as comma-separated, no extra text.`;
    const result = await invokeLLM({ prompt });
    if (result) setFormTags(result);
    setLoading(false);
  };

  // Link functions
  const addLink = () => {
    if (!newLink.trim()) return;
    setFormLinks([...formLinks, { url: newLink, title: newLink.substring(0, 40) }]);
    setNewLink("");
  };

  const removeLink = (idx) => setFormLinks(formLinks.filter((_, i) => i !== idx));

  // CRUD
  const saveMemory = () => {
    if (!formTitle) return;
    const newMemory = {
      id: editingId || Date.now(),
      title: formTitle,
      description: formDescription || "No description",
      category: formCategory,
      tags: formTags.split(",").map(t => t.trim()).filter(t => t),
      importance: formImportance,
      links: formLinks,
      createdAt: editingId ? memories.find(m => m.id === editingId)?.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    if (editingId) {
      setMemories(memories.map(m => m.id === editingId ? newMemory : m));
    } else {
      setMemories([newMemory, ...memories]);
      setTimeout(() => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" }), 100);
    }
    resetForm();
    setShowAddForm(false);
    setEditingId(null);
  };

  const deleteMemory = (id) => {
    setMemories(memories.filter(m => m.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const editMemory = (mem) => {
    setFormTitle(mem.title);
    setFormDescription(mem.description);
    setFormCategory(mem.category);
    setFormTags(mem.tags.join(", "));
    setFormImportance(mem.importance);
    setFormLinks(mem.links || []);
    setEditingId(mem.id);
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormTitle("");
    setFormDescription("");
    setFormCategory("other");
    setFormTags("");
    setFormImportance(3);
    setFormLinks([]);
    setNewLink("");
  };

  const toggleImportance = (id) => {
    setMemories(memories.map(m => m.id === id 
      ? { ...m, importance: m.importance === 5 ? 1 : m.importance + 1 } 
      : m
    ));
  };

  const copyLink = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter & Sort
  const filtered = memories.filter(m => {
    const matchSearch = searchTerm === "" || 
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCat = selectedCategory === "all" || m.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (a.importance !== b.importance) return b.importance - a.importance;
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  const formatDate = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    if (diff < 7) return `${diff} days ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-full bg-[#111111] text-white">
      {/* HEADER - FIXED */}
      <div className="p-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-red-400" />
            <h2 className="text-lg font-bold">🧠 Memory Bank</h2>
          </div>
          <div className="flex gap-1">
            <button onClick={() => { const data = JSON.stringify(memories); const blob = new Blob([data]); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "memories.json"; a.click(); }} className="p-1.5 rounded text-white/40 hover:text-white hover:bg-white/10">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="🔍 Search memories..." className="pl-9 bg-[#1a1a1a] border-white/10 text-white" />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto">
          <button onClick={() => setSelectedCategory("all")} className={`px-2 py-1 rounded-md text-xs ${selectedCategory === "all" ? "bg-white/20 text-white" : "bg-white/5 text-white/60"}`}>📋 All ({memories.length})</button>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`px-2 py-1 rounded-md text-xs ${selectedCategory === cat.id ? cat.color : "bg-white/5 text-white/60"}`}>{cat.name}</button>
          ))}
        </div>
      </div>

      {/* ADD BUTTON - FIXED */}
      <div className="p-4 flex-shrink-0">
        {!showAddForm ? (
          <Button onClick={() => setShowAddForm(true)} className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold">
            <Plus className="w-4 h-4 mr-2" /> ✨ Add New Memory
          </Button>
        ) : (
          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 space-y-3">
            <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="📝 Chat title / Memory name..." className="bg-[#0d0d0d] border-white/10 text-white" />
            
            <Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="📄 Description..." className="bg-[#0d0d0d] border-white/10 text-white resize-none min-h-[70px]" />
            
            {/* AI Buttons */}
            <div className="flex gap-2">
              <Button onClick={aiDescribe} disabled={loading || !formTitle} variant="outline" size="sm" className="flex-1 border-white/20 text-white/60 hover:text-white">
                <Sparkles className="w-3 h-3 mr-1" /> ✨ AI Describe
              </Button>
              <Button onClick={aiSuggestTags} disabled={loading || (!formTitle && !formDescription)} variant="outline" size="sm" className="flex-1 border-white/20 text-white/60 hover:text-white">
                <Tag className="w-3 h-3 mr-1" /> 🏷️ Suggest Tags
              </Button>
            </div>
            
            {/* Links */}
            <div className="space-y-2">
              <label className="text-white/50 text-xs flex items-center gap-1"><Link2 className="w-3 h-3" /> 🔗 Link Related Chats</label>
              <div className="flex gap-2">
                <Input value={newLink} onChange={(e) => setNewLink(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addLink()} placeholder="Paste URL or chat ID..." className="flex-1 bg-[#0d0d0d] border-white/10 text-white text-sm" />
                <Button onClick={addLink} size="sm" variant="outline" className="border-white/20 text-white/60"><Plus className="w-3 h-3" /></Button>
              </div>
              {formLinks.length > 0 && (
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {formLinks.map((link, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white/5 rounded px-2 py-1">
                      <span className="text-white/60 text-xs truncate">{link.title}</span>
                      <button onClick={() => removeLink(idx)} className="text-white/30 hover:text-red-400"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="flex-1 bg-[#0d0d0d] border border-white/10 rounded-md px-3 py-2 text-white text-sm">
                {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
              <Input value={formTags} onChange={(e) => setFormTags(e.target.value)} placeholder="🏷️ Tags (comma-separated)" className="flex-1 bg-[#0d0d0d] border-white/10 text-white text-sm" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-white/50 text-xs">⭐ Importance:</span>
                {[1,2,3,4,5].map(s => (
                  <button key={s} onClick={() => setFormImportance(s)}><Star className={`w-4 h-4 ${s <= formImportance ? "text-yellow-400 fill-yellow-400" : "text-white/30"}`} /></button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button onClick={saveMemory} disabled={!formTitle} size="sm" className="bg-green-500/20 text-green-400"><Save className="w-3 h-3 mr-1" /> 💾 Save</Button>
                <Button onClick={() => { resetForm(); setShowAddForm(false); setEditingId(null); }} variant="ghost" size="sm" className="text-white/40"><X className="w-3 h-3" /></Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MEMORIES LIST - SCROLLABLE */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {sorted.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">📭 No memories found</p>
          </div>
        ) : (
          sorted.map(memory => (
            <div key={memory.id} className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
              <div onClick={() => setExpandedId(expandedId === memory.id ? null : memory.id)} className="p-3 cursor-pointer hover:bg-white/5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="w-3.5 h-3.5 text-white/40" />
                      <h3 className="text-white font-medium text-sm">{memory.title}</h3>
                    </div>
                    <p className="text-white/50 text-xs line-clamp-1">{memory.description}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="flex gap-0.5 mr-1">
                      {[1,2,3,4,5].map(s => <Star key={s} onClick={(e) => { e.stopPropagation(); toggleImportance(memory.id); }} className={`w-3 h-3 ${s <= memory.importance ? "text-yellow-400 fill-yellow-400" : "text-white/20"}`} />)}
                    </div>
                    {expandedId === memory.id ? <ChevronDown className="w-4 h-4 text-white/40" /> : <ChevronRight className="w-4 h-4 text-white/40" />}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`${CATEGORIES.find(c => c.id === memory.category)?.color} px-1.5 py-0.5 rounded text-xs`}>
                    {CATEGORIES.find(c => c.id === memory.category)?.name}
                  </span>
                  <span className="text-white/30 text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(memory.updatedAt)}</span>
                  {memory.links?.length > 0 && <span className="text-white/30 text-xs flex items-center gap-1"><Link2 className="w-3 h-3" /> 🔗 {memory.links.length}</span>}
                </div>
              </div>

              {expandedId === memory.id && (
                <div className="px-3 pb-3 pt-0 border-t border-white/10 space-y-2">
                  <div>
                    <span className="text-white/40 text-xs">📄 Description</span>
                    <p className="text-white/70 text-sm">{memory.description}</p>
                  </div>
                  
                  {memory.links?.length > 0 && (
                    <div>
                      <span className="text-white/40 text-xs flex items-center gap-1"><Link2 className="w-3 h-3" /> 🔗 Linked Chats</span>
                      <div className="space-y-1 mt-1">
                        {memory.links.map((link, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-white/5 rounded px-2 py-1.5">
                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-white/60 hover:text-cyan-400 text-xs truncate">
                              <ExternalLink className="w-3 h-3" /> {link.title}
                            </a>
                            <button onClick={() => copyLink(link.url, memory.id)} className="text-white/30 hover:text-white">
                              {copiedId === memory.id ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {memory.tags.length > 0 && (
                    <div>
                      <span className="text-white/40 text-xs">🏷️ Tags</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {memory.tags.map(tag => <span key={tag} className="px-1.5 py-0.5 bg-white/10 rounded text-xs text-white/60">#{tag}</span>)}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-1">
                    <Button onClick={() => editMemory(memory)} variant="ghost" size="sm" className="w-7 h-7 text-white/40 hover:text-white"><Edit2 className="w-3 h-3" /></Button>
                    <Button onClick={() => deleteMemory(memory.id)} variant="ghost" size="sm" className="w-7 h-7 text-white/40 hover:text-red-400"><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Sample data
const SAMPLE_MEMORIES = [
  {
    id: 1,
    title: "Project Alpha Planning",
    description: "Discussed timeline and resource allocation for Q2 deliverables",
    category: "work",
    tags: ["project", "planning"],
    importance: 5,
    links: [{ url: "#chat:alpha-2024", title: "Alpha Kickoff Chat" }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "React Performance Tips",
    description: "Learned about memo, useCallback, and useMemo optimization",
    category: "coding",
    tags: ["react", "performance"],
    importance: 4,
    links: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: "Japan Vacation Plans",
    description: "Tokyo, Osaka, and Kyoto itinerary for spring",
    category: "personal",
    tags: ["travel", "japan"],
    importance: 3,
    links: [{ url: "https://japan-guide.com", title: "Japan Travel Guide" }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];