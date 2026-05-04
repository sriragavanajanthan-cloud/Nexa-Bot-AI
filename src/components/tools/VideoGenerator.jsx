import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Video, Sparkles, Settings, Film, 
  Loader2, Download, RefreshCw, 
  Sliders, Zap, Crop,
  Wand2, Image as ImageIcon, Music, Type
} from "lucide-react";

// Video quality presets
const QUALITY_PRESETS = [
  { id: "draft", label: "Draft", resolution: "540p", speed: "fast", icon: Zap },
  { id: "standard", label: "Standard", resolution: "720p", speed: "medium", icon: Video },
  { id: "hd", label: "HD", resolution: "1080p", speed: "slow", icon: Settings },
  { id: "cinematic", label: "Cinematic", resolution: "1080p", speed: "slower", icon: Film }
];

// Video styles
const VIDEO_STYLES = [
  { id: "cinematic", label: "Cinematic", prompt: "cinematic lighting, shallow depth of field, film grain, dramatic mood" },
  { id: "realistic", label: "Realistic", prompt: "photorealistic, natural lighting, sharp details, authentic textures" },
  { id: "anime", label: "Anime", prompt: "anime style, cel-shaded, vibrant colors, Japanese animation aesthetic" },
  { id: "cyberpunk", label: "Cyberpunk", prompt: "cyberpunk, neon lights, dark cityscape, futuristic, high contrast" },
  { id: "vintage", label: "Vintage", prompt: "vintage film, warm tones, grain, retro aesthetic, 80s style" },
  { id: "fantasy", label: "Fantasy", prompt: "fantasy, magical, ethereal, soft lighting, dreamlike atmosphere" }
];

// Aspect ratios
const ASPECT_RATIOS = [
  { id: "16:9", label: "16:9 (Landscape)", width: 16, height: 9 },
  { id: "9:16", label: "9:16 (Portrait)", width: 9, height: 16 },
  { id: "1:1", label: "1:1 (Square)", width: 1, height: 1 }
];

// Music options
const MUSIC_OPTIONS = [
  { id: "none", name: "No Music", url: null },
  { id: "upbeat", name: "🎵 Upbeat", url: "/music/upbeat.mp3" },
  { id: "cinematic", name: "🎬 Cinematic", url: "/music/cinematic.mp3" },
  { id: "calm", name: "🌊 Calm", url: "/music/calm.mp3" }
];

// Backend API URL
const API_URL = "https://nexabot-video-api.onrender.com";

// Loading Skeleton Component
function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 animate-pulse">
          <div className="flex gap-3">
            <div className="w-20 h-12 bg-white/10 rounded"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-white/10 rounded w-24"></div>
              <div className="h-3 bg-white/10 rounded w-32"></div>
              <div className="h-3 bg-white/10 rounded w-40"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function VideoGenerator() {
  const [prompt, setPrompt] = useState("");
  const [selectedQuality, setSelectedQuality] = useState(QUALITY_PRESETS[1]);
  const [selectedStyle, setSelectedStyle] = useState(VIDEO_STYLES[0]);
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0]);
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [videoOptions, setVideoOptions] = useState([]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [mode, setMode] = useState("text");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [selectedMusic, setSelectedMusic] = useState(MUSIC_OPTIONS[0]);
  const [textOverlay, setTextOverlay] = useState("");
  const [showTextOverlay, setShowTextOverlay] = useState(false);
  
  const abortControllerRef = useRef(null);

  // Calculate total duration in seconds
  const getTotalDuration = () => {
    return (durationMinutes * 60) + durationSeconds;
  };

  // Fetch video options
  const fetchVideoOptions = async () => {
    if (!prompt.trim() && mode === "text") {
      setError("Please describe your video");
      return;
    }

    setLoadingOptions(true);
    setError("");
    setVideoOptions([]);
    setGeneratedVideo(null);

    const fullPrompt = mode === "text" 
      ? `${prompt}. ${selectedStyle.prompt}`
      : prompt;

    try {
      const response = await fetch(`${API_URL}/options`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          topic: fullPrompt,
          max_options: 6
        })
      });

      const data = await response.json();
      
      if (data.options && data.options.length > 0) {
        setVideoOptions(data.options);
      } else {
        setError("No videos found. Try different keywords.");
      }
    } catch (err) {
      setError(`Failed to connect to backend.`);
    } finally {
      setLoadingOptions(false);
    }
  };

  // Cancel generation
  const cancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setGenerating(false);
      setProgress(0);
      setError("Generation cancelled");
    }
  };

  // Assemble selected video
  const assembleSelectedVideo = async (videoUrl) => {
    const totalDuration = getTotalDuration();
    if (totalDuration < 2) {
      setError("Duration must be at least 2 seconds");
      return;
    }

    setGenerating(true);
    setProgress(0);
    setError("");
    setGeneratedVideo(null);
    setVideoOptions([]);
    
    abortControllerRef.current = new AbortController();

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 500);

    try {
      const fullPrompt = mode === "text" 
        ? `${prompt}. ${selectedStyle.prompt}`
        : prompt;

      const response = await fetch(`${API_URL}/assemble`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          topic: fullPrompt,
          video_url: videoUrl,
          duration: totalDuration,
          quality: selectedQuality.id,
          aspectRatio: aspectRatio.id,
          style: selectedStyle.id,
          music: selectedMusic.url,
          text_overlay: showTextOverlay ? textOverlay : null
        }),
        signal: abortControllerRef.current.signal
      });

      const data = await response.json();

      if (response.ok && data.video_url) {
        setProgress(100);
        setGeneratedVideo({
          url: data.video_url,
          duration: totalDuration,
          resolution: selectedQuality.resolution,
          style: selectedStyle.label
        });
      } else {
        setError(data.error || "Failed to assemble video");
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(`Failed to assemble video`);
      }
    } finally {
      clearInterval(interval);
      setGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedImage({ url, name: file.name, file });
      setError("");
    }
  };

  const downloadVideo = () => {
    if (generatedVideo?.url) {
      window.open(generatedVideo.url, "_blank");
    }
  };

  const resetAll = () => {
    setPrompt("");
    setVideoOptions([]);
    setGeneratedVideo(null);
    setError("");
    setTextOverlay("");
    setShowTextOverlay(false);
  };

  const getGenerationTime = () => {
    const totalDuration = getTotalDuration();
    const baseTime = totalDuration * 2;
    const qualityFactor = selectedQuality.id === "draft" ? 0.5 : 
                         selectedQuality.id === "cinematic" ? 2 : 1;
    return Math.round(baseTime * qualityFactor);
  };

  const formatDurationDisplay = () => {
    const total = getTotalDuration();
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
          <Film className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">AI Video Studio</h2>
          <p className="text-white/40 text-sm">Create videos with AI</p>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 bg-[#1a1a1a] rounded-xl p-1">
        <button
          onClick={() => setMode("text")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === "text" 
              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" 
              : "text-white/60 hover:text-white/80"
          }`}
        >
          <Wand2 className="w-4 h-4" />
          Text to Video
        </button>
        <button
          onClick={() => setMode("image")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === "image" 
              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" 
              : "text-white/60 hover:text-white/80"
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          Image to Video
        </button>
      </div>

      {/* Image Upload */}
      {mode === "image" && (
        <div 
          onClick={() => document.getElementById("image-upload").click()}
          className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500/50 transition-colors"
        >
          {uploadedImage ? (
            <div className="space-y-3">
              <img src={uploadedImage.url} alt="Uploaded" className="max-h-32 mx-auto rounded-lg" />
              <p className="text-white/60 text-sm">{uploadedImage.name}</p>
              <button 
                onClick={(e) => { e.stopPropagation(); setUploadedImage(null); }}
                className="text-red-400 text-xs hover:text-red-300"
              >
                Remove
              </button>
            </div>
          ) : (
            <>
              <ImageIcon className="w-12 h-12 text-white/30 mx-auto mb-3" />
              <p className="text-white/60 text-sm">Click to upload an image</p>
              <p className="text-white/30 text-xs mt-1">PNG, JPG, WEBP up to 10MB</p>
            </>
          )}
          <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </div>
      )}

      {/* Prompt Input */}
      <div className="space-y-2">
        <label className="text-white/70 text-sm font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          {mode === "text" ? "Describe your video" : "Describe the animation"}
        </label>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="A cinematic shot of a futuristic city at night, neon lights reflecting on wet streets..."
          className="bg-[#1a1a1a] border-white/10 text-white resize-none min-h-[100px]"
        />
      </div>

      {/* Style Selection */}
      <div className="space-y-2">
        <label className="text-white/70 text-sm font-medium">🎨 Video Style</label>
        <div className="grid grid-cols-3 gap-2">
          {VIDEO_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style)}
              className={`p-2 rounded-lg text-xs transition-colors ${
                selectedStyle.id === style.id
                  ? "bg-purple-500 text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quality */}
      <div className="space-y-2">
        <label className="text-white/70 text-sm font-medium">📹 Quality</label>
        <div className="grid grid-cols-4 gap-2">
          {QUALITY_PRESETS.map((quality) => (
            <button
              key={quality.id}
              onClick={() => setSelectedQuality(quality)}
              className={`p-2 rounded-lg text-xs transition-colors ${
                selectedQuality.id === quality.id
                  ? "bg-purple-500 text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {quality.label}
            </button>
          ))}
        </div>
      </div>

      {/* Aspect Ratio & Duration */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-white/70 text-sm font-medium">📐 Aspect Ratio</label>
          <div className="flex gap-2">
            {ASPECT_RATIOS.map((ratio) => (
              <button
                key={ratio.id}
                onClick={() => setAspectRatio(ratio)}
                className={`flex-1 p-2 rounded-lg text-xs transition-colors ${
                  aspectRatio.id === ratio.id
                    ? "bg-purple-500 text-white"
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                {ratio.id}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-white/70 text-sm font-medium">⏱️ Duration</label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="number"
                min="0"
                max="5"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Math.min(5, parseInt(e.target.value) || 0))}
                className="bg-[#1a1a1a] border-white/10 text-white text-center"
                placeholder="Min"
              />
              <div className="text-white/40 text-xs text-center mt-1">Minutes</div>
            </div>
            <div className="flex-1">
              <Input
                type="number"
                min="0"
                max="59"
                value={durationSeconds}
                onChange={(e) => setDurationSeconds(Math.min(59, parseInt(e.target.value) || 0))}
                className="bg-[#1a1a1a] border-white/10 text-white text-center"
                placeholder="Sec"
              />
              <div className="text-white/40 text-xs text-center mt-1">Seconds</div>
            </div>
          </div>
          <div className="text-center text-purple-400 text-xs">
            Total: {formatDurationDisplay()}
          </div>
        </div>
      </div>

      {/* Text Overlay */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowTextOverlay(!showTextOverlay)}
          className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm transition-colors ${
            showTextOverlay ? "bg-purple-500 text-white" : "bg-white/5 text-white/60"
          }`}
        >
          <Type className="w-4 h-4" />
          Add Text Overlay
        </button>
      </div>

      {showTextOverlay && (
        <Input
          value={textOverlay}
          onChange={(e) => setTextOverlay(e.target.value)}
          placeholder="Enter text to display on video..."
          className="bg-[#1a1a1a] border-white/10 text-white"
        />
      )}

      {/* Background Music */}
      <div className="space-y-2">
        <label className="text-white/70 text-sm font-medium flex items-center gap-2">
          <Music className="w-4 h-4 text-purple-400" />
          Background Music
        </label>
        <div className="flex gap-2 flex-wrap">
          {MUSIC_OPTIONS.map((music) => (
            <button
              key={music.id}
              onClick={() => setSelectedMusic(music)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                selectedMusic.id === music.id
                  ? "bg-purple-500 text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {music.name}
            </button>
          ))}
        </div>
      </div>

      {/* Estimated time */}
      <div className="bg-[#1a1a1a] rounded-lg p-3 flex items-center justify-between text-sm">
        <span className="text-white/40">Estimated processing time</span>
        <span className="text-purple-400">~{getGenerationTime()} seconds</span>
      </div>

      {/* Find Video Options Button */}
      {!videoOptions.length && !loadingOptions && !generating && !generatedVideo && (
        <Button
          onClick={fetchVideoOptions}
          disabled={loadingOptions || (mode === "text" ? !prompt.trim() : !uploadedImage)}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-6"
        >
          {loadingOptions ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Finding videos...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 mr-2" />
              Find Video Options
            </>
          )}
        </Button>
      )}

      {/* Loading Skeletons */}
      {loadingOptions && <LoadingSkeleton />}

      {/* Video Options */}
      {videoOptions.length > 0 && !generating && !generatedVideo && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">Choose a video clip:</h3>
            <button onClick={resetAll} className="text-white/40 text-sm hover:text-white/60">
              Clear & Start Over
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
            {videoOptions.map((opt) => (
              <div
                key={opt.id}
                onClick={() => assembleSelectedVideo(opt.url)}
                className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 cursor-pointer hover:border-purple-500 transition-colors flex gap-3"
              >
                <div className="w-24 h-14 bg-[#0d0d0d] rounded overflow-hidden flex-shrink-0">
                  <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <Film className="w-6 h-6 text-white/40" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-white text-sm font-medium">Option {opt.id}</div>
                  <div className="text-white/40 text-xs">Duration: {opt.duration}s</div>
                  <div className="text-white/40 text-xs truncate">Tags: {opt.tags}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress */}
      {generating && (
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-white/40">Assembling video...</span>
            <span className="text-purple-400">~{Math.ceil((100 - progress) / 10)}s remaining</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <Button onClick={cancelGeneration} variant="outline" className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10">
            Cancel Generation
          </Button>
        </div>
      )}

      {/* Result */}
      {generatedVideo && (
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">Generated Video</h3>
            <div className="flex gap-2">
              <button onClick={resetAll} className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10">
                <RefreshCw className="w-4 h-4" />
              </button>
              <button onClick={downloadVideo} className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="aspect-video bg-[#0d0d0d] rounded-lg flex items-center justify-center">
            {generatedVideo.url ? (
              <video src={generatedVideo.url} controls className="w-full h-full rounded-lg" />
            ) : (
              <div className="text-center">
                <Film className="w-12 h-12 text-white/20 mx-auto mb-2" />
                <p className="text-white/40 text-sm">Video Preview</p>
              </div>
            )}
          </div>
          
          <div className="flex gap-4 text-sm flex-wrap">
            <div>
              <span className="text-white/40">Style:</span>
              <span className="text-white/80 ml-2">{generatedVideo.style}</span>
            </div>
            <div>
              <span className="text-white/40">Duration:</span>
              <span className="text-white/80 ml-2">
                {Math.floor(generatedVideo.duration / 60)}m {generatedVideo.duration % 60}s
              </span>
            </div>
            <div>
              <span className="text-white/40">Resolution:</span>
              <span className="text-white/80 ml-2">{generatedVideo.resolution}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
