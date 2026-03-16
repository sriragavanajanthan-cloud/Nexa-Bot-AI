import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Wand2, Download } from "lucide-react";

export default function ImageEditor() {
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [instruction, setInstruction] = useState("");
  const [resultUrl, setResultUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setUploadedUrl(file_url);
    setResultUrl(null);
    setUploading(false);
  };

  const editImage = async () => {
    if (!uploadedUrl || !instruction.trim()) return;
    setLoading(true);
    const result = await base44.integrations.Core.GenerateImage({
      prompt: instruction,
      existing_image_urls: [uploadedUrl],
    });
    setResultUrl(result?.url || null);
    setLoading(false);
  };

  const download = (url) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = "nexabot-edited.png";
    a.click();
  };

  return (
    <div className="flex flex-col h-full bg-[#111111] text-white p-4 gap-4">
      <div className="flex items-center gap-2">
        <Wand2 className="w-5 h-5 text-cyan-400" />
        <h2 className="text-lg font-bold">Image Editor</h2>
      </div>

      {/* Upload */}
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

      <Textarea
        value={instruction}
        onChange={e => setInstruction(e.target.value)}
        placeholder="Describe what you want to change or add to the image..."
        className="bg-[#1a1a1a] border-white/10 text-white resize-none min-h-[80px]"
      />

      <Button onClick={editImage} disabled={loading || !uploadedUrl || !instruction.trim()} className="bg-gradient-to-r from-cyan-500 to-green-400 text-black font-semibold">
        <Wand2 className="w-4 h-4 mr-2" />
        {loading ? "Editing..." : "Apply Edit"}
      </Button>

      {loading && (
        <div className="flex items-center justify-center py-6">
          <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      )}

      {resultUrl && !loading && (
        <div className="flex flex-col gap-2">
          <p className="text-white/50 text-xs">Result:</p>
          <div className="relative rounded-xl overflow-hidden border border-white/10 group">
            <img src={resultUrl} alt="Edited" className="w-full object-cover rounded-xl" />
          </div>
          <Button variant="outline" onClick={() => download(resultUrl)} className="border-white/10 text-white bg-transparent hover:bg-white/10">
            <Download className="w-4 h-4 mr-2" /> Download
          </Button>
        </div>
      )}
    </div>
  );
}