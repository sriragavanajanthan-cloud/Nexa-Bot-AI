import { useState, useRef, useEffect } from "react";
import { Plus, MessageSquare, Trash2, ChevronLeft, ChevronRight, Archive, Pin, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

function ContextMenu({ x, y, conv, onDelete, onClose, onRename, onPin, onArchive }) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const items = [
    { label: "Rename", icon: Pencil, color: "text-red-400", action: () => { onRename(conv.id); onClose(); } },
    { label: conv.pinned ? "Unpin" : "Pin", icon: Pin, color: "text-orange-400", action: () => { onPin(conv.id); onClose(); } },
    { label: "Archive", icon: Archive, color: "text-yellow-400", action: () => { onArchive(conv.id); onClose(); } },
    { label: "Delete", icon: Trash2, color: "text-red-500", action: () => { onDelete(conv.id); onClose(); } },
  ];

  return (
    <div
      ref={ref}
      style={{ position: "fixed", top: y, left: x, zIndex: 9999 }}
      className="bg-[#1a1a1a] border border-white/15 rounded-xl shadow-2xl py-1 min-w-[160px]"
    >
      {items.map(({ label, icon: Icon, color, action }) => (
        <button
          key={label}
          onClick={(e) => { e.stopPropagation(); action(); }}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors text-left"
        >
          <Icon className={cn("w-4 h-4", color)} />
          {label}
        </button>
      ))}
    </div>
  );
}

export default function Sidebar({ conversations, currentId, onSelect, onCreate, onDelete, onRename, onPin, onArchive, collapsed, onToggle }) {
  const [contextMenu, setContextMenu] = useState(null); // { x, y, conv }
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const handleContextMenu = (e, conv) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, conv });
  };

  const startRename = (id) => {
    const conv = conversations.find(c => c.id === id);
    setRenameValue(conv?.metadata?.name || conv?.title || "New Chat");
    setRenamingId(id);
  };

  const commitRename = (id) => {
    if (renameValue.trim()) onRename?.(id, renameValue.trim());
    setRenamingId(null);
  };

  const getIcon = (conv) => {
    if (conv.pinned) return <Pin className="w-3.5 h-3.5 text-orange-400 shrink-0" />;
    if (conv.archived) return <Archive className="w-3.5 h-3.5 text-yellow-400 shrink-0" />;
    return <MessageSquare className="w-4 h-4 text-white/50 shrink-0" />;
  };

  return (
    <div className={cn(
      "flex flex-col bg-[#0d0d0d] border-r border-white/10 transition-all duration-300",
      collapsed ? "w-10" : "w-64"
    )}>
      {/* Header - Chevron button removed */}
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <img src="https://qxgkityhhwgwohehetek.supabase.co/storage/v1/object/public/Nexa/926442f73_NEXAbotAI.jpg" className="w-7 h-7 rounded-full" alt="logo" />
             <span className="text-white font-bold text-sm">NEXAbot.AI</span>
          </div>
        )}
        {/* Chevron button removed */}
      </div>

      {/* New Chat */}
      <div className="p-2">
        <Button
          onClick={onCreate}
          className={cn(
            "w-full bg-gradient-to-r from-cyan-500 to-green-400 hover:opacity-90 text-black font-semibold",
            collapsed ? "px-0" : ""
          )}
        >
          <Plus className="w-4 h-4" />
          {!collapsed && <span className="ml-1">New Chat</span>}
        </Button>
      </div>

      {/* Conversations */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => renamingId !== conv.id && onSelect(conv.id)}
              onContextMenu={(e) => !collapsed && handleContextMenu(e, conv)}
              className={cn(
                "group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors min-w-0",
                currentId === conv.id ? "bg-white/15" : "hover:bg-white/8"
              )}
            >
              {getIcon(conv)}
              {!collapsed && (
                renamingId === conv.id ? (
                  <div className="flex items-center gap-1 flex-1 min-w-0" onClick={e => e.stopPropagation()}>
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") commitRename(conv.id); if (e.key === "Escape") setRenamingId(null); }}
                      className="flex-1 bg-white/10 text-white text-sm rounded px-1 py-0.5 outline-none border border-cyan-500/50 min-w-0"
                    />
                    <button onClick={() => commitRename(conv.id)} className="text-green-400 hover:text-green-300"><Check className="w-3 h-3" /></button>
                    <button onClick={() => setRenamingId(null)} className="text-white/40 hover:text-white"><X className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <>
                    <span className="text-white/80 text-sm truncate flex-1 overflow-hidden whitespace-nowrap">
                      {conv.metadata?.name || conv.title || "New Chat"}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 w-6 h-6 text-white/40 hover:text-red-400 hover:bg-transparent"
                      onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </>
                )
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          conv={contextMenu.conv}
          onDelete={onDelete}
          onClose={() => setContextMenu(null)}
          onRename={startRename}
          onPin={onPin || (() => {})}
          onArchive={onArchive || (() => {})}
        />
      )}
    </div>
  );
}
