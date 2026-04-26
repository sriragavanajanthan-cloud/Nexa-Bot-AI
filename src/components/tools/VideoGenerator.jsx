import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Video, Sparkles, Settings, Film, 
  Loader2, Download, RefreshCw, 
  Sliders, Zap, Clock, Crop,
  Wand2, Volume2, Image as ImageIcon
} from "lucide-react";

// Video quality presets
const QUALITY_PRESETS = [
  { id: "draft", label: "Draft", resolution: "540p", fps: 24, speed: "fast", icon: Zap },
  { id: "standard", label: "Standard", resolution: "720p", fps: 24, speed: "medium", icon: Video },
  { id: "hd", label: "HD", resolution: "1080p", fps: 30, speed: "slow", icon: Settings },
  { id: "cinematic", label: "Cinematic", resolution: "1080p", fps: 48, speed: "slower", icon: Film }
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

// Engine API URL
const ENGINE_URL = import.meta.env.VITE_VIDEO_ENGINE_URL || "http://localhost:3000";

export default function VideoGenerator() {
  const [prompt, setPrompt] = useState("");
  const [selectedQuality, setSelectedQuality] = useState(QUALITY_PRESETS[1]);
  const [selectedStyle, setSelectedStyle] = useState(VIDEO_STYLES[0]);
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0]);
  const [duration, setDuration] = useState(5);
  const [customFPS, setCustomFPS] = useState(24);
  const [useCustomFPS, setUseCustomFPS] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [mode, setMode] = useState("text");
  const [progress, setProgress] = useState(0);
  const [jobId, setJobId] = useState(null);
  const [error, setError] = useState("");

  const generateVideo = async () => {
    if (!prompt.trim() && mode === "text") {
      setError("Please describe your video");
      return;
    }
    if (!uploadedImage && mode === "image") {
      setError("Please upload an image");
      return;
    }

    setGenerating(true);
    setProgress(0);
    setError("");
    setJobId(null);
    setGeneratedVideo(null);

    const fps = useCustomFPS ? customFPS : selectedQuality.fps;
    const width = aspectRatio.width === 16 ? 1280 : aspectRatio.width === 9 ? 720 : 720;
    const height = aspectRatio.height === 9 ? 720 : 1280;

    try {
      // Start generation job
      const startRes = await fetch(`${ENGINE_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script: mode === "text" ? `${prompt}. ${selectedStyle.prompt}` : prompt,
          style: selectedStyle.prompt,
          duration: duration,
          fps: fps,
          width: width,
          height: height,
          quality: selectedQuality.id,
          ...(mode === "image" && uploadedImage && { imageUrl: uploadedImage.url })
        })
      });

      if (!startRes.ok) {
        throw new Error(`Engine error: ${startRes.status}`);
      }

      const { jobId: newJobId } = await startRes.json();
      setJobId(newJobId);

      // Poll for completion
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(`${ENGINE_URL}/api/status/${newJobId}`);
          const data = await statusRes.json();
          
          setProgress(data.progress || 0);
          
          if (data.status === "completed") {
            clearInterval(pollInterval);
            setGeneratedVideo({
              url: data.videoUrl,
              duration: duration,
              fps: fps,
              resolution: selectedQuality.resolution,
              style: selectedStyle.label
            });
            setGenerating(false);
          } else if (data.status === "failed") {
            clearInterval(pollInterval);
            setError(data.error || "Generation failed");
            setGenerating(false);
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 2000);
      
    } catch (err) {
      console.error("Generation error:", err);
      setError(`Failed to connect to engine at ${ENGINE_URL}. Make sure it's running.`);
      setGenerating(false);
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

  const regenerate = () => {
    setGeneratedVideo(null);
    generateVideo();
  };

  const getGenerationTime = () => {
    const baseTime = duration * 2;
    const qualityFactor = selectedQuality.id === "draft" ? 0.5 : 
                         selectedQuality.id === "cinematic" ? 2 : 1;
    const fpsFactor = (useCustomFPS ? customFPS : selectedQuality.fps) / 24;
    return Math.round(baseTime * qualityFactor * fpsFactor);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
          <Film className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">AI Video Generator</h2>
          <p className="text-white/40 text-sm">Create cinematic videos with AI</p>
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
          placeholder={mode === "text" 
            ? "A cinematic shot of a futuristic city at night, neon lights reflecting on wet streets, slow camera pan..."
            : "The character slowly turns and looks at the camera, dramatic lighting, cinematic reveal..."
          }
          className="bg-[#1a1a1a] border-white/10 text-white resize-none min-h-[100px]"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Quality Presets */}
      <div className="space-y-3">
        <label className="text-white/70 text-sm font-medium flex items-center gap-2">
          <Sliders className="w-4 h-4 text-purple-400" />
          Quality & Speed
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {QUALITY_PRESETS.map((quality) => {
            const Icon = quality.icon;
            const isSelected = selectedQuality.id === quality.id && !useCustomFPS;
            return (
              <button
                key={quality.id}
                onClick={() => {
                  setSelectedQuality(quality);
                  setUseCustomFPS(false);
                }}
                className={`p-3 rounded-xl border transition-all text-left ${
                  isSelected
                    ? "border-purple-500 bg-purple-500/10"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <Icon className={`w-4 h-4 mb-2 ${isSelected ? "text-purple-400" : "text-white/40"}`} />
                <div className="text-white text-sm font-medium">{quality.label}</div>
                <div className="text-white/40 text-xs">{quality.resolution} • {quality.fps} fps</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="bg-[#1a1a1a] rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-white/70 text-sm font-medium flex items-center gap-2">
            <Settings className="w-4 h-4 text-purple-400" />
            Advanced Settings
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-sm">Custom Frame Rate</span>
            <button
              onClick={() => setUseCustomFPS(!useCustomFPS)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                useCustomFPS 
                  ? "bg-purple-500 text-white" 
                  : "bg-white/10 text-white/60"
              }`}
            >
              {useCustomFPS ? "Custom" : "Auto"}
            </button>
          </div>

          {useCustomFPS && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-white/60 text-sm">FPS</span>
                <span className="text-purple-400 text-sm font-medium">{customFPS} fps</span>
              </div>
              <input
                type="range"
                min="12"
                max="60"
                step="1"
                value={customFPS}
                onChange={(e) => setCustomFPS(parseInt(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-white/30 text-xs">
                <span>Cinematic (24)</span>
                <span>Standard (30)</span>
                <span>High (48-60)</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-white/60 text-sm flex items-center gap-1">
                <Clock className="w-3 h-3" /> Duration
              </span>
              <span className="text-purple-400 text-sm font-medium">{duration} seconds</span>
            </div>
            <input
              type="range"
              min="2"
              max="10"
              step="1"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          <div className="space-y-2">
            <span className="text-white/60 text-sm flex items-center gap-1">
              <Crop className="w-3 h-3" /> Aspect Ratio
            </span>
            <div className="flex gap-2">
              {ASPECT_RATIOS.map((ratio) => (
                <button
                  key={ratio.id}
                  onClick={() => setAspectRatio(ratio)}
                  className={`flex-1 py-2 rounded-lg text-sm transition-colors ${
                    aspectRatio.id === ratio.id
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                      : "bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  {ratio.id}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Video Styles */}
      <div className="space-y-3">
        <label className="text-white/70 text-sm font-medium flex items-center gap-2">
          <Film className="w-4 h-4 text-purple-400" />
          Video Style
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {VIDEO_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style)}
              className={`p-2 rounded-lg text-sm transition-colors ${
                selectedStyle.id === style.id
                  ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generation Info */}
      <div className="bg-[#1a1a1a] rounded-lg p-3 flex items-center justify-between text-sm">
        <span className="text-white/40">Estimated generation time</span>
        <span className="text-white/60">~{getGenerationTime()} seconds</span>
      </div>

      {/* Generate Button */}
      <Button
        onClick={generateVideo}
        disabled={generating || (mode === "text" ? !prompt.trim() : !uploadedImage)}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white font-semibold py-6"
      >
        {generating ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Generating... {progress}%
          </>
        ) : (
          <>
            <Wand2 className="w-5 h-5 mr-2" />
            Generate Video
          </>
        )}
      </Button>

      {/* Progress Bar */}
      {generating && (
        <div className="space-y-2">
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-white/40 text-xs text-center">
            {jobId ? `Job ID: ${jobId.slice(0, 8)}...` : "Creating your video..."}
          </p>
        </div>
      )}

      {/* Result */}
      {generatedVideo && (
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">Generated Video</h3>
            <div className="flex gap-2">
              <button onClick={regenerate} className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10">
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
                <p className="text-white/30 text-xs mt-1">
                  {duration}s • {generatedVideo.fps} fps • {generatedVideo.resolution}
                </p>
              </div>
            )}
          </div>
          
          <div className="flex gap-4 text-sm">
            <div>
              <span className="text-white/40">Style:</span>
              <span className="text-white/80 ml-2">{generatedVideo.style}</span>
            </div>
            <div>
              <span className="text-white/40">Duration:</span>
              <span className="text-white/80 ml-2">{generatedVideo.duration}s</span>
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