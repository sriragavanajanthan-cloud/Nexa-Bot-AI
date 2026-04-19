import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Import all tool components
import MemoryBank from "./MemoryBank";
import AIDetector from "./AIDetector";
import ImageVideoGenerator from "./ImageVideoGenerator";
import ImageEditor from "./ImageEditor";
import GraphingTool from "./GraphingTool";
import ImageAmplifier from "./ImageAmplifier";

const TOOLS = [
  { id: "memory", label: "Memory Bank", icon: "📝", color: "text-red-400", component: MemoryBank },
  { id: "aidetect", label: "AI Detector", icon: "🔍", color: "text-orange-400", component: AIDetector },
  { id: "imagegen", label: "Image Generator", icon: "🎨", color: "text-yellow-400", component: ImageVideoGenerator },
  { id: "imageedit", label: "Image Editor", icon: "✏️", color: "text-green-400", component: ImageEditor },
  { id: "graph", label: "Graphing", icon: "📊", color: "text-blue-400", component: GraphingTool },
  { id: "amplify", label: "Image Amplifier", icon: "🔊", color: "text-purple-400", component: ImageAmplifier },
];

// Mobile-optimized Modal Component
function ToolModal({ tool, onClose }) {
  const ToolComponent = tool.component;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 bg-black/70 transition-all duration-300",
        isMobile ? "flex items-end" : "flex items-center justify-center"
      )}
      onClick={onClose}
    >
      <div 
        className={cn(
          "bg-[#1a1a1a] border-white/10 shadow-2xl overflow-hidden transition-all duration-300",
          isMobile 
            ? "w-full rounded-t-2xl max-h-[90vh] animate-slide-up" 
            : "relative w-full max-w-2xl max-h-[85vh] rounded-xl border"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-[#1a1a1a] px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn("text-xl", tool.color)}>{tool.icon}</span>
            <h2 className="text-white font-semibold text-base sm:text-lg">{tool.label}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors active:bg-white/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Modal Content */}
        <div className="overflow-y-auto" style={{ maxHeight: isMobile ? 'calc(90vh - 60px)' : 'calc(85vh - 60px)' }}>
          <ToolComponent />
        </div>
      </div>
    </div>
  );
}

export default function ToolsPanel({ onClose }) {
  const [activeTool, setActiveTool] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleToolClick = (tool) => {
    setActiveTool(tool);
  };

  const handleCloseModal = () => {
    setActiveTool(null);
  };

  return (
    <>
      {/* Tools Panel Sidebar */}
      <div className="flex h-full bg-[#0d0d0d] border-l border-white/10" style={{ width: isMobile ? '100%' : 320 }}>
        <div className="flex flex-col w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="text-white font-bold text-sm">🛠️ AI Tools</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="w-8 h-8 text-white/40 hover:text-white hover:bg-white/10 rounded-lg">
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Tools List */}
          <div className="flex-1 p-3 space-y-1 overflow-y-auto">
            {TOOLS.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 active:bg-white/10 transition-colors text-left group"
              >
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                  <span className={cn("text-xl", tool.color)}>{tool.icon}</span>
                </div>
                <span className="text-white/80 text-sm font-medium flex-1">{tool.label}</span>
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal - opens when a tool is clicked */}
      {activeTool && (
        <ToolModal tool={activeTool} onClose={handleCloseModal} />
      )}
    </>
  );
}