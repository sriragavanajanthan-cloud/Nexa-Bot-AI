import { useState, useEffect } from "react";
import { invokeLLM } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeftRight, Languages, Copy, Check, AlertCircle, Volume2, Trash2 } from "lucide-react";

const LANGUAGES = [
  { code: "auto", name: "Auto-Detect" },
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ar", name: "Arabic" },
  { code: "ru", name: "Russian" },
  { code: "hi", name: "Hindi" },
  { code: "nl", name: "Dutch" },
  { code: "pl", name: "Polish" },
  { code: "tr", name: "Turkish" },
  { code: "sv", name: "Swedish" },
  { code: "da", name: "Danish" },
  { code: "no", name: "Norwegian" },
  { code: "fi", name: "Finnish" },
  { code: "he", name: "Hebrew" },
  { code: "th", name: "Thai" },
  { code: "vi", name: "Vietnamese" },
  { code: "id", name: "Indonesian" },
  { code: "ms", name: "Malay" },
  { code: "el", name: "Greek" },
  { code: "cs", name: "Czech" },
  { code: "hu", name: "Hungarian" },
  { code: "ro", name: "Romanian" },
  { code: "uk", name: "Ukrainian" },
];

export default function LanguageTranslator() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [from, setFrom] = useState("auto");
  const [to, setTo] = useState("es");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState("");

  // Auto-swap when languages are the same (except auto)
  useEffect(() => {
    if (from !== "auto" && to !== "auto" && from === to) {
      const availableLang = LANGUAGES.find(l => l.code !== from && l.code !== "auto")?.code || "es";
      setTo(availableLang);
    }
  }, [from, to]);

  const translate = async () => {
    if (!input.trim()) {
      setError("Please enter text to translate");
      return;
    }
    
    if (input.length > 5000) {
      setError("Text exceeds 5000 character limit");
      return;
    }
    
    setError("");
    setLoading(true);
    
    const fromLang = from === "auto" ? "auto-detected" : LANGUAGES.find(l => l.code === from)?.name;
    const toLang = LANGUAGES.find(l => l.code === to)?.name;
    
    const prompt = from === "auto"
      ? `Detect the language of the following text, then translate it to ${toLang}. 
         Return ONLY the translated text, nothing else. Do not include the detected language.
         
         Text to translate:
         "${input}"`
      : `Translate the following text from ${fromLang} to ${toLang}. 
         Return ONLY the translated text, nothing else.
         
         Text to translate:
         "${input}"`;
    
    try {
      const result = await invokeLLM({ prompt });
      setOutput(result || "");
      
      // Optional: Try to detect language from response for auto mode
      if (from === "auto" && result) {
        // You could add a separate API call to detect language
        // For now, just show that detection happened
        setDetectedLanguage("Detected");
      }
    } catch (err) {
      console.error("Translation error:", err);
      setError("Translation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const swap = () => {
    if (from === "auto") {
      setError("Cannot swap with auto-detect enabled");
      return;
    }
    setFrom(to);
    setTo(from);
    setInput(output);
    setOutput("");
    setError("");
  };

  const copy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
    setError("");
    setCopied(false);
    setDetectedLanguage("");
  };

  const getLanguageName = (code) => {
    return LANGUAGES.find(l => l.code === code)?.name || code;
  };

  const canTranslate = input.trim() && !loading;

  return (
    <div className="flex flex-col h-full bg-[#111111] text-white p-4 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Languages className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold">Language Translator</h2>
        </div>
        {(input || output) && (
          <button
            onClick={clearAll}
            className="text-white/40 hover:text-white/70 text-xs transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {/* Language selection */}
      <div className="flex items-center gap-2">
        <Select value={from} onValueChange={setFrom}>
          <SelectTrigger className="flex-1 bg-[#1a1a1a] border-white/10 text-white focus:border-cyan-400/50">
            <SelectValue placeholder="From" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a1a] border-white/10 text-white max-h-60">
            {LANGUAGES.map(l => (
              <SelectItem key={l.code} value={l.code}>
                {l.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={swap} 
          disabled={from === "auto"}
          className="text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
          title={from === "auto" ? "Cannot swap with auto-detect" : "Swap languages"}
        >
          <ArrowLeftRight className="w-4 h-4" />
        </Button>
        
        <Select value={to} onValueChange={setTo}>
          <SelectTrigger className="flex-1 bg-[#1a1a1a] border-white/10 text-white focus:border-cyan-400/50">
            <SelectValue placeholder="To" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a1a] border-white/10 text-white max-h-60">
            {LANGUAGES.filter(l => l.code !== "auto").map(l => (
              <SelectItem key={l.code} value={l.code}>
                {l.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Input area */}
      <div className="relative">
        <Textarea 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          placeholder={`Enter text to translate to ${getLanguageName(to)}...`} 
          className="bg-[#1a1a1a] border-white/10 text-white resize-none min-h-[120px] focus:border-cyan-400/50 pr-16"
        />
        <div className="absolute bottom-2 right-2 text-white/30 text-xs">
          {input.length}/5000
        </div>
      </div>

      {/* Detected language indicator (for auto mode) */}
      {from === "auto" && detectedLanguage && input && (
        <div className="text-white/40 text-xs flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Language auto-detected
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-400/10 border border-red-400/20">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Translate button */}
      <Button 
        onClick={translate} 
        disabled={!canTranslate} 
        className="bg-gradient-to-r from-cyan-500 to-green-400 text-black font-semibold hover:opacity-90 transition-opacity"
      >
        {loading ? "Translating..." : "Translate"}
      </Button>

      {/* Output area */}
      {output && (
        <div className="relative bg-[#1a1a1a] border border-white/10 rounded-xl p-4 animate-in fade-in duration-300">
          <div className="flex items-start justify-between gap-2">
            <p className="text-white/80 text-sm whitespace-pre-wrap flex-1">{output}</p>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={copy} 
                className="w-7 h-7 text-white/40 hover:text-white"
                title="Copy translation"
              >
                {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
              </Button>
            </div>
          </div>
          
          {/* Language direction indicator */}
          <div className="mt-2 text-white/30 text-xs flex items-center gap-1">
            <Languages className="w-3 h-3" />
            {from === "auto" ? "Auto-detected →" : `${getLanguageName(from)} →`} {getLanguageName(to)}
          </div>
        </div>
      )}

      {/* Character limit info */}
      <div className="text-white/20 text-xs text-center">
        Supports up to 5,000 characters per translation
      </div>
    </div>
  );
}