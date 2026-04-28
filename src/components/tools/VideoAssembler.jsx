import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2, Download } from "lucide-react";

export default function VideoAssembler() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState("");

  const assembleVideo = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic");
      return;
    }

    setLoading(true);
    setError("");
    setVideoUrl(null);

    try {
      const response = await fetch("http://localhost:5001/assemble", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic })
      });

      const data = await response.json();
      if (data.video_url) {
        setVideoUrl(data.video_url);
      } else {
        setError(data.error || "Failed to assemble video");
      }
    } catch (err) {
      setError("Connection error. Make sure the backend server is running on port 5001.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">AI Video Assembler</h2>
          <p className="text-white/40 text-xs">Generate a complete video from a topic</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && assembleVideo()}
          placeholder="Enter a topic (e.g., 'space exploration')"
          className="flex-1 bg-[#1a1a1a] border-white/10 text-white"
        />
        <Button onClick={assembleVideo} disabled={loading} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate"}
        </Button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {videoUrl && (
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
          <video src={videoUrl} controls className="w-full" />
          <div className="p-4">
            <a href={videoUrl} download className="text-white/40 hover:text-white flex items-center gap-2">
              <Download className="w-4 h-4" /> Download Video
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
