import { useState } from "react";
import { generateImage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon, Download, Sparkles } from "lucide-react";

export default function ImageVideoGenerator() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setImageUrl(null);
    const result = await generateImage({ prompt });
    setImageUrl(result?.url || null);
    setLoading(false);
  };

  const download = () => {
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = "nexabot-generated.png";
    a.click();
  };

  return (
    <div className="flex flex-col h-full bg-[#111111] text-white p-4 gap-4">
      <div className="flex items-center gap-2">
        <ImageIcon className="w-5 h-5 text-cyan-400" />
        <h2 className="text-lg font-bold">Image Generator</h2>
      </div>

      <Textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="Describe the image you want to generate..."
        className="bg-[#1a1a1a] border-white/10 text-white resize-none min-h-[100px]"
      />

      <Button onClick={generate} disabled={loading || !prompt.trim()} className="bg-gradient-to-r from-cyan-500 to-green-400 text-black font-semibold">
        <Sparkles className="w-4 h-4 mr-2" />
        {loading ? "Generating..." : "Generate Image"}
      </Button>

      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mx-auto" />
            <p className="text-white/50 text-sm">Creating your image...</p>
          </div>
        </div>
      )}

      {imageUrl && !loading && (
        <div className="flex-1 flex flex-col gap-3">
          <div className="relative rounded-xl overflow-hidden border border-white/10 group">
            <img src={imageUrl} alt="Generated" className="w-full object-cover rounded-xl" />
            <Button onClick={download} variant="ghost" size="icon" className="absolute top-3 right-3 bg-black/60 text-white hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity">
              <Download className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="outline" onClick={download} className="border-white/10 text-white bg-transparent hover:bg-white/10">
            <Download className="w-4 h-4 mr-2" /> Download Image
          </Button>
        </div>
      )}
    </div>
  );
}
