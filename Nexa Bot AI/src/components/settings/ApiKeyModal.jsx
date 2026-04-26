import { useState } from "react";
import { setApiKey, getApiKey } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Key, X } from "lucide-react";

export default function ApiKeyModal({ onClose }) {
  const [key, setKey] = useState(getApiKey());

  const handleSave = () => {
    if (!key.trim()) return;
    setApiKey(key.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] border border-white/15 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-cyan-400" />
            <h2 className="text-white font-bold text-lg">OpenAI API Key</h2>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-white/50 text-sm mb-4">
          Enter your OpenAI API key to power NEXAbot.AI. Your key is stored locally in your browser only.
        </p>
        <input
          type="password"
          value={key}
          onChange={e => setKey(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSave()}
          placeholder="sk-..."
          className="w-full bg-[#0d0d0d] border border-white/15 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 outline-none focus:border-cyan-500/50 mb-4"
          autoFocus
        />
        <div className="flex gap-2">
          <Button onClick={onClose} variant="ghost" className="flex-1 text-white/60 hover:text-white hover:bg-white/10">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!key.trim()} className="flex-1 bg-gradient-to-r from-cyan-500 to-green-400 text-black font-semibold">
            Save Key
          </Button>
        </div>
        <p className="text-white/30 text-xs mt-3 text-center">
          Get your key at{" "}
          <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">
            platform.openai.com
          </a>
        </p>
      </div>
    </div>
  );
}
