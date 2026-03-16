import { useState, useRef } from "react";
import { Send, Paperclip, Mic, MicOff, X, File, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import ToolsPanel from "@/components/tools/ToolsPanel";

export default function ChatInput({ onSend, isLoading }) {
  const [toolsOpen, setToolsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [attachedFiles, setAttachedFiles] = useState([]); // { name, url }
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  const handleSend = () => {
    if ((!input.trim() && attachedFiles.length === 0) || isLoading) return;
    const fileUrls = attachedFiles.map(f => f.url);
    onSend(input.trim(), fileUrls.length > 0 ? fileUrls : undefined);
    setInput("");
    setAttachedFiles([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setAttachedFiles(prev => [...prev, { name: file.name, url: file_url }]);
    }
    setUploading(false);
    e.target.value = "";
  };

  const removeFile = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const toggleRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recording is not supported in this browser. Try Chrome.");
      return;
    }

    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(prev => prev ? prev + " " + transcript : transcript);
    };
    recognition.onend = () => setRecording(false);
    recognition.onerror = () => setRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  };

  const canSend = (input.trim() || attachedFiles.length > 0) && !isLoading && !uploading;

  return (
    <div className="relative p-4 border-t border-white/10 bg-[#0d0d0d]">
      {/* Tools Popover */}
      {toolsOpen && (
        <div className="absolute bottom-full left-4 mb-2 z-50 rounded-2xl overflow-hidden shadow-2xl border border-white/10" style={{ width: 380, maxHeight: "70vh" }}>
          <ToolsPanel onClose={() => setToolsOpen(false)} />
        </div>
      )}
      <div className="max-w-5xl mx-auto space-y-2">
        {/* Attached files */}
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 px-1">
            {attachedFiles.map((file, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-white/10 rounded-lg px-2 py-1 text-xs text-white/80">
                <File className="w-3 h-3 text-cyan-400" />
                <span className="max-w-[140px] truncate">{file.name}</span>
                <button onClick={() => removeFile(i)} className="text-white/40 hover:text-white ml-1">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2 bg-[#1a1a1a] rounded-2xl border border-white/10 p-3 focus-within:border-cyan-500/50 transition-colors">
          {/* File attach */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || isLoading}
            className="text-white/40 hover:text-white hover:bg-white/10 w-8 h-8 shrink-0"
            title="Attach file"
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} />

          {/* Tools toggle */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setToolsOpen(v => !v)}
            className={`w-8 h-8 shrink-0 ${toolsOpen ? "text-white bg-white/10" : "text-white/40 hover:text-white hover:bg-white/10"}`}
            title="Tools"
          >
            <Wrench className="w-4 h-4" />
          </Button>

          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={recording ? "Listening..." : uploading ? "Uploading..." : "Message NEXAbot.AI..."}
            className="flex-1 bg-transparent border-none resize-none text-white placeholder:text-white/30 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[24px] max-h-32 text-sm"
            rows={1}
            disabled={isLoading}
          />

          {/* Voice record */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleRecording}
            disabled={isLoading}
            className={`w-8 h-8 shrink-0 ${recording ? "text-red-400 animate-pulse hover:text-red-300" : "text-white/40 hover:text-white hover:bg-white/10"}`}
            title={recording ? "Stop recording" : "Voice input"}
          >
            {recording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>

          <Button
            onClick={handleSend}
            disabled={!canSend}
            size="icon"
            className="bg-gradient-to-r from-cyan-500 to-green-400 hover:opacity-90 text-black rounded-xl w-9 h-9 shrink-0 disabled:opacity-30"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-center text-white/20 text-xs">NEXAbot.AI can make mistakes. Consider checking important information.</p>
      </div>
    </div>
  );
}