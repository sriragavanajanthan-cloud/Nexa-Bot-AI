import { useState, useEffect, useRef } from "react";
import { invokeLLM } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Brain, Search, Plus, Trash2, Edit2, Save, X, 
  FolderOpen, MessageSquare, Sparkles, Tag, 
  Clock, ChevronRight, ChevronDown, Download,
  Star, Link2, ExternalLink, Copy, Check
} from "lucide-react";

// Simple categories
const CATEGORIES = ["💼 Work", "🏠 Personal", "💻 Coding", "📚 Learning", "📁 Other"];

export default function MemoryBank() {
  const [memories, setMemories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  
  const scrollRef = useRef(null);

  // Form state
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [cat, setCat] = useState("📁 Other");
  const [tags, setTags] = useState("");
  const [stars, setStars] = useState(3);
  const [links, setLinks] = useState([]);
  const [newLink, setNewLink] = useState("");

  // Load saved memories
  useEffect(() => {
    const saved = localStorage.getItem("memories");
    if (saved) setMemories(JSON.parse(saved));
    else setMemories(SAMPLE);
  }, []);

  // Save memories
  useEffect(() => {
    if (memories.length) localStorage.setItem("memories", JSON.stringify(memories));
  }, [memories]);

  // AI: Generate description
  const genDesc = async () => {
    if (!title) return;
    setLoading(true);
    const res = await invokeLLM({ prompt: `Write a short description for a chat titled: "${title}"` });
    if (res) setDesc(res);
    setLoading(false);
  };

  // AI: Suggest tags
  const genTags = async () => {
    if (!title && !desc) return;
    setLoading(true);
    const res = await invokeLLM({ prompt: `Suggest 3 tags for: "${title} ${desc}". Return as comma-separated.` });
    if (res) setTags(res);
    setLoading(false);
  };

  // Add link
  const addLink = () => {
    if (!newLink) return;
    setLinks([...links, { url: newLink, name: newLink.slice(0, 40) }]);
    setNewLink("");
  };

  // Save memory
  const save = () => {
    if (!title) return;
    const memory = {
      id: editingId || Date.now(),
      title,
      desc: desc || "No description",
      category: cat,
      tags: tags.split(",").map(t => t.trim()).filter(t => t),
      stars,
      links,
      date: new Date().toISOString(),
    };
    
    if (editingId) {
      setMemories(memories.map(m => m.id === editingId ? memory : m));
    } else {
      setMemories([memory, ...memories]);
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
    
    reset();
    setShowForm(false);
    setEditingId(null);
  };

  // Reset form
  const reset = () => {
    setTitle("");
    setDesc("");
    setCat("📁 Other");
    setTags("");
    setStars(3);
    setLinks([]);
    setNewLink("");
  };

  // Delete memory
  const del = (id) => {
    setMemories(memories.filter(m => m.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  // Edit memory
  const edit = (m) => {
    setTitle(m.title);
    setDesc(m.desc);
    setCat(m.category);
    setTags(m.tags.join(", "));
    setStars(m.stars);
    setLinks(m.links || []);
    setEditingId(m.id);
    setShowForm(true);
  };

  // Copy link
  const copyLink = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter memories
  const filtered = memories.filter(m => {
    const matchSearch = search === "" || 
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.desc.toLowerCase().includes(search.toLowerCase()) ||
      m.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchCat = category === "all" || m.category === category;
    return matchSearch && matchCat;
  });

  // Sort by stars (highest first)
  const sorted = [...filtered].sort((a, b) => b.stars - a.stars);

  // Format date
  const formatDate = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    if (diff < 7) return `${diff} days ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="flex flex-col bg-[#111111] text-white" style={{ height: '100%', maxHeight: '100vh' }}>
      {/* Header - Fixed */}
      <div className="flex-shrink-0 p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-red-400" />
            <h2 className="text-lg font-bold">🧠 Memory Bank</h2>
          </div>
          <button onClick={() => { const data = JSON.stringify(memories); const blob = new Blob([data]); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "memories.json"; a.click(); }} className="p-1.5 rounded text-white/40 hover:text-white">
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Search..." className="pl-9 bg-[#1a1a1a] border-white/10 text-white" />
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto">
          <button onClick={() => setCategory("all")} className={`px-2 py-1 rounded-md text-xs ${category === "all" ? "bg-white/20 text-white" : "bg-white/5 text-white/60"}`}>📋 All ({memories.length})</button>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} className={`px-2 py-1 rounded-md text-xs ${category === c ? "bg-white/20 text-white" : "bg-white/5 text-white/60"}`}>{c}</button>
          ))}
        </div>
      </div>

      {/* Add Button - Fixed */}
      <div className="flex-shrink-0 p-4">
        {!showForm ? (
          <Button onClick={() => setShowForm(true)} className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white">
            <Plus className="w-4 h-4 mr-2" /> ✨ Add Memory
          </Button>
        ) : (
          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 space-y-3">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="📝 Title..." className="bg-[#0d0d0d] border-white/10 text-white" />
            <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="📄 Description..." className="bg-[#0d0d0d] border-white/10 text-white resize-none min-h-[70px]" />
            
            {/* AI Buttons */}
            <div className="flex gap-2">
              <Button 
                onClick={genDesc} 
                disabled={loading || !title} 
                variant="outline" 
                size="sm" 
                className="flex-1 border-white/20 bg-gray-600/30 text-white/80 hover:bg-gray-600/50"
              >
                <Sparkles className="w-3 h-3 mr-1" /> ✨ AI Describe
              </Button>
              <Button 
                onClick={genTags} 
                disabled={loading || (!title && !desc)} 
                variant="outline" 
                size="sm" 
                className="flex-1 border-white/20 bg-gray-600/30 text-white/80 hover:bg-gray-600/50"
              >
                <Tag className="w-3 h-3 mr-1" /> 🏷️ Suggest Tags
              </Button>
            </div>
            
            {/* Links */}
            <div>
              <label className="text-white/50 text-xs">🔗 Links</label>
              <div className="flex gap-2 mt-1">
                <Input value={newLink} onChange={(e) => setNewLink(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addLink()} placeholder="Paste URL..." className="flex-1 bg-[#0d0d0d] border-white/10 text-white text-sm" />
                <Button onClick={addLink} size="sm" variant="outline" className="border-white/20"><Plus className="w-3 h-3" /></Button>
              </div>
              {links.map((link, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white/5 rounded px-2 py-1 mt-1">
                  <span className="text-white/60 text-xs truncate">{link.name}</span>
                  <button onClick={() => setLinks(links.filter((_, i) => i !== idx))} className="text-white/30 hover:text-red-400"><X className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
            
            {/* Category & Tags */}
            <div className="flex gap-2">
              <select value={cat} onChange={(e) => setCat(e.target.value)} className="flex-1 bg-[#0d0d0d] border border-white/10 rounded-md px-3 py-2 text-white text-sm">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="🏷️ Tags (comma)" className="flex-1 bg-[#0d0d0d] border-white/10 text-white text-sm" />
            </div>
            
            {/* Stars & Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {[1,2,3,4,5].map(s => (
                  <button key={s} onClick={() => setStars(s)}><Star className={`w-5 h-5 ${s <= stars ? "text-yellow-400 fill-yellow-400" : "text-white/30"}`} /></button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button onClick={save} disabled={!title} size="sm" className="bg-green-500/20 text-green-400"><Save className="w-3 h-3 mr-1" /> Save</Button>
                <Button onClick={() => { reset(); setShowForm(false); setEditingId(null); }} variant="ghost" size="sm" className="text-white/40"><X className="w-3 h-3" /></Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SCROLLABLE MEMORIES LIST - Shows ~3 memories before scrolling */}
      <div 
        ref={scrollRef} 
        className="px-4 pb-4 space-y-2"
        style={{ 
          overflowY: 'auto',
          maxHeight: '320px',
          minHeight: '100px'
        }}
      >
        {sorted.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">📭 No memories yet</p>
            <p className="text-white/30 text-xs">Click "Add Memory" to start</p>
          </div>
        ) : (
          sorted.map(m => (
            <div key={m.id} className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
              {/* Memory Header - Click to expand/collapse */}
              <div onClick={() => setExpandedId(expandedId === m.id ? null : m.id)} className="p-3 cursor-pointer hover:bg-white/5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-white font-medium text-sm">{m.title}</h3>
                    <p className="text-white/50 text-xs line-clamp-1 mt-0.5">{m.desc}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="flex gap-0.5 mr-1">
                      {[1,2,3,4,5].map(s => <Star key={s} onClick={(e) => { e.stopPropagation(); setMemories(memories.map(mem => mem.id === m.id ? {...mem, stars: s} : mem)); }} className={`w-3 h-3 ${s <= m.stars ? "text-yellow-400 fill-yellow-400" : "text-white/20"}`} />)}
                    </div>
                    {expandedId === m.id ? <ChevronDown className="w-4 h-4 text-white/40" /> : <ChevronRight className="w-4 h-4 text-white/40" />}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="bg-white/10 px-1.5 py-0.5 rounded text-xs">{m.category}</span>
                  <span className="text-white/30 text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(m.date)}</span>
                  {m.links?.length > 0 && <span className="text-white/30 text-xs">🔗 {m.links.length}</span>}
                </div>
              </div>

              {/* Expanded Content - NO SCROLLBAR HERE */}
              {expandedId === m.id && (
                <div className="px-3 pb-3 pt-0 border-t border-white/10 space-y-2">
                  <p className="text-white/70 text-sm">{m.desc}</p>
                  
                  {m.links?.length > 0 && (
                    <div>
                      <span className="text-white/40 text-xs">🔗 Links</span>
                      {m.links.map((link, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white/5 rounded px-2 py-1.5 mt-1">
                          <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-cyan-400 text-xs truncate flex-1">{link.name}</a>
                          <button onClick={() => copyLink(link.url, m.id)} className="text-white/30 hover:text-white ml-2">
                            {copiedId === m.id ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {m.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {m.tags.map(tag => <span key={tag} className="px-1.5 py-0.5 bg-white/10 rounded text-xs">#{tag}</span>)}
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => edit(m)} className="p-1.5 rounded text-white/40 hover:text-white"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => del(m.id)} className="p-1.5 rounded text-white/40 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
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
const SAMPLE = [
  {
    id: 1,
    title: "Project Alpha",
    desc: "Planning and timeline for Q2 deliverables",
    category: "💼 Work",
    tags: ["planning", "deadlines"],
    stars: 5,
    links: [{ url: "#chat:alpha", name: "Alpha Chat" }],
    date: new Date().toISOString(),
  },
  {
    id: 2,
    title: "React Tips",
    desc: "useMemo, useCallback, and performance optimization",
    category: "💻 Coding",
    tags: ["react", "performance"],
    stars: 4,
    links: [],
    date: new Date().toISOString(),
  },
  {
    id: 3,
    title: "Japan Trip",
    desc: "Tokyo and Kyoto itinerary for spring",
    category: "🏠 Personal",
    tags: ["travel", "japan"],
    stars: 3,
    links: [{ url: "https://japan-guide.com", name: "Travel Guide" }],
    date: new Date().toISOString(),
  },
];