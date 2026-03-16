import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Brain, Search } from "lucide-react";

export default function MemoryBank() {
  const [memories, setMemories] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchMemories(); }, []);

  const fetchMemories = async () => {
    const data = await base44.entities.Memory.list("-created_date");
    setMemories(data || []);
  };

  const saveMemory = async () => {
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    await base44.entities.Memory.create({ title, content, tags });
    setTitle(""); setContent(""); setTags("");
    await fetchMemories();
    setLoading(false);
  };

  const deleteMemory = async (id) => {
    await base44.entities.Memory.delete(id);
    setMemories(prev => prev.filter(m => m.id !== id));
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

      <div className="bg-[#1a1a1a] rounded-xl border border-white/10 p-4 space-y-3">
        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title..." className="bg-[#0d0d0d] border-white/10 text-white" />
        <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Content to remember..." className="bg-[#0d0d0d] border-white/10 text-white min-h-[80px]" />
        <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="Tags (comma separated)" className="bg-[#0d0d0d] border-white/10 text-white" />
        <Button onClick={saveMemory} disabled={loading} className="w-full bg-gradient-to-r from-cyan-500 to-green-400 text-black font-semibold">
          <Plus className="w-4 h-4 mr-1" /> Save Memory
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search memories..." className="pl-9 bg-[#1a1a1a] border-white/10 text-white" />
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {filtered.map(m => (
          <div key={m.id} className="bg-[#1a1a1a] border border-white/10 rounded-xl p-3 group">
            <div className="flex justify-between items-start">
              <p className="font-semibold text-cyan-300 text-sm">{m.title}</p>
              <Button variant="ghost" size="icon" className="w-6 h-6 opacity-0 group-hover:opacity-100 text-red-400 hover:bg-transparent" onClick={() => deleteMemory(m.id)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
            <p className="text-white/70 text-sm mt-1">{m.content}</p>
            {m.tags && <p className="text-white/30 text-xs mt-1"># {m.tags}</p>}
          </div>
        ))}
        {filtered.length === 0 && <p className="text-white/30 text-sm text-center py-8">No memories yet.</p>}
      </div>
    </div>
  );
}