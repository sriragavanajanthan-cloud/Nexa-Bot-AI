import { useState, useEffect } from "react";
import { getMemories, createMemory, deleteMemory } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Plus, Trash2, Search } from "lucide-react";

export default function MemoryBank() {
  const [memories, setMemories] = useState([]);
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");

  useEffect(() => {
    setMemories(getMemories());
  }, []);

  const handleAdd = () => {
    if (!title.trim() || !content.trim()) return;
    createMemory({ title, content, tags });
    setMemories(getMemories());
    setTitle(""); setContent(""); setTags(""); setAdding(false);
  };

  const handleDelete = (id) => {
    deleteMemory(id);
    setMemories(getMemories());
  };

  const filtered = memories.filter(m =>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#111111] text-white p-4 gap-4">
      <div className="flex items-center gap-2">
        <Brain className="w-5 h-5 text-cyan-400" />
        <h2 className="text-lg font-bold">Memory Bank</h2>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search memories..."
          className="bg-[#1a1a1a] border-white/10 text-white pl-9 placeholder:text-white/30"
        />
      </div>

      <Button onClick={() => setAdding(v => !v)} className="bg-gradient-to-r from-cyan-500 to-green-400 text-black font-semibold">
        <Plus className="w-4 h-4 mr-2" /> Add Memory
      </Button>

      {adding && (
        <div className="space-y-2 bg-[#1a1a1a] border border-white/10 rounded-xl p-3">
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="bg-[#0d0d0d] border-white/10 text-white placeholder:text-white/30" />
          <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Content" className="bg-[#0d0d0d] border-white/10 text-white resize-none min-h-[80px] placeholder:text-white/30" />
          <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="Tags (comma separated)" className="bg-[#0d0d0d] border-white/10 text-white placeholder:text-white/30" />
          <Button onClick={handleAdd} disabled={!title.trim() || !content.trim()} className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-semibold">Save</Button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-2">
        {filtered.map(m => (
          <div key={m.id} className="group bg-[#1a1a1a] border border-white/10 rounded-xl p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{m.title}</p>
                <p className="text-white/50 text-xs mt-1 line-clamp-2">{m.content}</p>
                {m.tags && <p className="text-cyan-400/60 text-xs mt-1">{m.tags}</p>}
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)} className="opacity-0 group-hover:opacity-100 w-7 h-7 text-white/40 hover:text-red-400 hover:bg-transparent shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-white/30 text-sm text-center py-8">No memories yet</p>
        )}
      </div>
    </div>
  );
}
