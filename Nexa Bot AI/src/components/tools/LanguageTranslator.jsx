import { useState } from "react";
import { invokeLLM } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeftRight, Languages, Copy, Check } from "lucide-react";

const LANGUAGES = [
  "English","Spanish","French","German","Italian","Portuguese","Chinese","Japanese",
  "Korean","Arabic","Russian","Hindi","Dutch","Polish","Turkish","Swedish","Danish",
  "Norwegian","Finnish","Hebrew","Thai","Vietnamese","Indonesian","Malay","Greek"
];

export default function LanguageTranslator() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [from, setFrom] = useState("English");
  const [to, setTo] = useState("Spanish");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const translate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const result = await invokeLLM({ prompt: `Translate the following text from ${from} to ${to}. Return only the translated text, nothing else.\n\n"${input}"` });
    setOutput(result || "");
    setLoading(false);
  };

  const swap = () => { setFrom(to); setTo(from); setInput(output); setOutput(""); };

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#111111] text-white p-4 gap-4">
      <div className="flex items-center gap-2">
        <Languages className="w-5 h-5 text-cyan-400" />
        <h2 className="text-lg font-bold">Language Translator</h2>
      </div>

      <div className="flex items-center gap-2">
        <Select value={from} onValueChange={setFrom}>
          <SelectTrigger className="flex-1 bg-[#1a1a1a] border-white/10 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a1a] border-white/10 text-white max-h-60">
            {LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="ghost" size="icon" onClick={swap} className="text-white/60 hover:text-white hover:bg-white/10">
          <ArrowLeftRight className="w-4 h-4" />
        </Button>
        <Select value={to} onValueChange={setTo}>
          <SelectTrigger className="flex-1 bg-[#1a1a1a] border-white/10 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a1a] border-white/10 text-white max-h-60">
            {LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Enter text to translate..." className="flex-1 bg-[#1a1a1a] border-white/10 text-white resize-none min-h-[120px]" />

      <Button onClick={translate} disabled={loading || !input.trim()} className="bg-gradient-to-r from-cyan-500 to-green-400 text-black font-semibold">
        {loading ? "Translating..." : "Translate"}
      </Button>

      {output && (
        <div className="relative bg-[#1a1a1a] border border-white/10 rounded-xl p-4">
          <p className="text-white/80 text-sm whitespace-pre-wrap">{output}</p>
          <Button variant="ghost" size="icon" onClick={copy} className="absolute top-2 right-2 w-7 h-7 text-white/40 hover:text-white">
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </Button>
        </div>
      )}
    </div>
  );
}
