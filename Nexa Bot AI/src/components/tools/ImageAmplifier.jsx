import { useState } from "react";
import { generateImage, uploadFile } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Zap, Download } from "lucide-react";

const ENHANCEMENTS = [
  { value: "enhance_quality", label: "Enhance Quality & Sharpness" },
  { value: "upscale", label: "Upscale & Increase Resolution" },
  { value: "vivid_colors", label: "Vivid Colors & Contrast" },
  { value: "hdr", label: "HDR Effect" },
  { value: "cinematic", label: "Cinematic Style" },
  { value: "portrait", label: "Portrait Enhancement" },
  { value: "remove_noise", label: "Remove Noise & Artifacts" },
];

export default function ImageAmplifier() {
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [enhancement, setEnhancement] = useState("enhance_quality");
  const [resultUrl, setResultUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await uploadFile(file);
    setUploadedUrl(file_url);
    setResultUrl(null);
    setUploading(false);
  };

  const amplify = async () => {
    if (!uploadedUrl) return;
    setLoading(true);
    const label = ENHANCEMENTS.find(e => e.value === enhancement)?.label || enhancement;
    const result = await generateImage({ prompt: `${label} — apply professional photo enhancement: improve quality, sharpness, lighting, and details dramatically.`, existing_image_urls: [uploadedUrl] });
    setResultUrl(result?.url || null);
    setLoading(false);
  };

  const download = (url) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = "nexabot-amplified.png";
    a.click();
  };

  return (
    <div className="flex flex-col h-full bg-[#111111] text-white p-4 gap-4">
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-cyan-400" />
        <h2 className="text-lg font-bold">Image Amplifier</h2>
      </div>

      <label className="cursor-pointer">
        <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-cyan-500/50 transition-colors">
          {uploading ? (
            <p className="text-white/50 text-sm">Uploading...</p>
          ) : uploadedUrl ? (
            <img src={uploadedUrl} alt="Uploaded" className="max-h-40 mx-auto rounded-lg object-contain" />
          ) : (
            <>
              <Upload className="w-8 h-8 mx-auto text-white/30 mb-2" />
              <p className="text-white/50 text-sm">Click to upload an image</p>
            </>
          )}
        </div>
        <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </label>

      <Select value={enhancement} onValueChange={setEnhancement}>
        <SelectTrigger className="bg-[#1a1a1a] border-white/10 text-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
          {ENHANCEMENTS.map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
        </SelectContent>
      </Select>

      <Button onClick={amplify} disabled={loading || !uploadedUrl} className="bg-gradient-to-r from-cyan-500 to-green-400 text-black font-semibold">
        <Zap className="w-4 h-4 mr-2" />
        {loading ? "Amplifying..." : "Amplify Image"}
      </Button>

      {loading && (
        <div className="flex items-center justify-center py-6">
          <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      )}

      {resultUrl && !loading && (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-white/30 text-xs mb-1 text-center">Original</p>
              <img src={uploadedUrl} alt="Original" className="w-full rounded-lg object-cover" />
            </div>
            <div>
              <p className="text-cyan-400 text-xs mb-1 text-center">Amplified</p>
              <img src={resultUrl} alt="Amplified" className="w-full rounded-lg object-cover" />
            </div>
          </div>
          <Button variant="outline" onClick={() => download(resultUrl)} className="border-white/10 text-white bg-transparent hover:bg-white/10">
            <Download className="w-4 h-4 mr-2" /> Download Amplified
          </Button>
        </div>
      )}
    </div>
  );
}
