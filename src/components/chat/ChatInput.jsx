import { useState, useRef } from "react";
import { Send, Paperclip, Mic, MicOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { uploadFile } from "@/lib/api";

export default function ChatInput({ onSend, isLoading }) {
  const [input, setInput] = useState("");
  const [attachedFiles, setAttachedFiles] = useState([]);
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
      const { file_url } = await uploadFile(file);
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
    <div className="border-t border-white/10 bg-[#111111] p-4">
      <div className="max-w-3xl mx-auto">
        {/* Attached files preview */}
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 px-1">
            {attachedFiles.map((file, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-gray-800 rounded-lg px-2 py-1 text-xs text-white/80">
                <Paperclip className="w-3 h-3 text-cyan-400" />
                <span className="max-w-[140px] truncate">{file.name}</span>
                <button onClick={() => removeFile(i)} className="text-white/40 hover:text-white ml-1">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input row */}
        <div className="flex items-end gap-2 bg-[#1a1a1a] rounded-2xl border border-white/10 p-2 focus-within:border-cyan-500/50 transition-colors">
          {/* Attach button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || isLoading}
            className="text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-colors"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} />

          {/* Text input */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={recording ? "Listening..." : "Message NEXAbot.AI..."}
            rows={1}
            className="flex-1 bg-transparent border-none resize-none text-white placeholder:text-gray-500 focus:outline-none min-h-[44px] max-h-32 py-2 text-base"
            disabled={isLoading}
          />

          {/* Voice button */}
          <button
            onClick={toggleRecording}
            disabled={isLoading}
            className={`p-2 rounded-xl transition-colors ${
              recording 
                ? "text-red-400 bg-red-500/10" 
                : "text-gray-400 hover:text-white hover:bg-white/10"
            }`}
            title={recording ? "Stop recording" : "Voice input"}
          >
            {recording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!canSend}
            className={`p-2 rounded-xl transition-all ${
              canSend
                ? "bg-gradient-to-r from-cyan-500 to-green-500 text-black hover:opacity-90"
                : "bg-gray-700 text-gray-500 cursor-not-allowed"
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
