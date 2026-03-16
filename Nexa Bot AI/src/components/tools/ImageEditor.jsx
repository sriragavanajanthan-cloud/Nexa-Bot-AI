import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Wand2, Download } from "lucide-react";

const getFilterFromInstruction = (instruction) => {
  const text = instruction.toLowerCase();
  const filters = [];

  if (text.includes("grayscale") || text.includes("black and white")) filters.push("grayscale(1)");
  if (text.includes("sepia") || text.includes("vintage")) filters.push("sepia(0.7)");
  if (text.includes("bright") || text.includes("brightness")) filters.push("brightness(1.15)");
  if (text.includes("dark") || text.includes("dim")) filters.push("brightness(0.85)");
  if (text.includes("contrast")) filters.push("contrast(1.2)");
  if (text.includes("blur") || text.includes("soft")) filters.push("blur(1.5px)");

  return filters.length ? filters.join(" ") : "saturate(1.1) contrast(1.05)";
};

const applyLocalEdit = (imageUrl, instruction) => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Could not get 2D context"));
      return;
    }

    ctx.filter = getFilterFromInstruction(instruction);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    resolve(canvas.toDataURL("image/png"));
  };
  img.onerror = () => reject(new Error("Failed to load image"));
  img.src = imageUrl;
});

export default function ImageEditor() {
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [instruction, setInstruction] = useState("");
  const [resultUrl, setResultUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => () => {
    if (uploadedUrl?.startsWith("blob:")) URL.revokeObjectURL(uploadedUrl);
  }, [uploadedUrl]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);

    const localUrl = URL.createObjectURL(file);
    setUploadedUrl(localUrl);
    setResultUrl(null);

    setUploading(false);
  };

  const editImage = async () => {
    if (!uploadedUrl || !instruction.trim()) return;

    setLoading(true);
    try {
      const editedDataUrl = await applyLocalEdit(uploadedUrl, instruction);
      setResultUrl(editedDataUrl);
    } catch {
      setResultUrl(uploadedUrl);
    } finally {
      setLoading(false);
    }
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

      <p className="text-xs text-white/50">Local mode: edits are applied in your browser (no Base44 required).</p>

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
        placeholder="Try: 'make it grayscale', 'vintage sepia', 'increase contrast'"
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
