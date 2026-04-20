import { useState, useEffect } from "react";
import { Brain, ScanSearch, ImageIcon, Wand2, BarChart2, Zap, Film, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import MemoryBank from "./MemoryBank";
import AIDetector from "./AIDetector";
import ImageVideoGenerator from "./ImageVideoGenerator";
import ImageEditor from "./ImageEditor";
import GraphingTool from "./GraphingTool";
import ImageAmplifier from "./ImageAmplifier";
import VideoGenerator from "./VideoGenerator";

const TOOLS = [
  { id: "memory", label: "Memory Bank", icon: Brain, color: "text-red-400", component: MemoryBank },
  { id: "aidetect", label: "AI Detector", icon: ScanSearch, color: "text-orange-400", component: AIDetector },
  { id: "imagegen", label: "Image Generator", icon: ImageIcon, color: "text-yellow-400", component: ImageVideoGenerator },
  { id: "imageedit", label: "Image Editor", icon: Wand2, color: "text-green-400", component: ImageEditor },
  { id: "graph", label: "Graphing", icon: BarChart2, color: "text-blue-400", component: GraphingTool },
  { id: "amplify", label: "Image Amplifier", icon: Zap, color: "text-purple-400", component: ImageAmplifier },
  { id: "videogen", label: "Video Generator", icon: Film, color: "text-pink-400", component: VideoGenerator },
];

// Modal Component for Tools
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
            : "relative w-full max-w-4xl max-h-[85vh] rounded-xl border"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-[#1a1a1a] px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <tool.icon className={cn("w-5 h-5", tool.color)} />
            <h2 className="text-white font-semibold text-lg">{tool.label}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Modal Content */}
        <div className="overflow-y-auto" style={{ maxHeight: isMobile ? 'calc(90vh - 70px)' : 'calc(85vh - 70px)' }}>
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
          <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
            <span className="text-white/60 text-sm font-medium tracking-wide">AI TOOLS</span>
            <button 
              onClick={onClose} 
              className="text-white/40 hover:text-white/70 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Tools List */}
          <div className="flex-1 py-3">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => handleToolClick(tool)}
                  className="w-full flex items-center gap-4 px-5 py-3 hover:bg-white/5 transition-colors text-left group"
                >
                  <Icon className={cn("w-5 h-5", tool.color)} />
                  <span className="text-white/80 text-base flex-1">{tool.label}</span>
                  <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/50 transition-colors" />
                </button>
              );
            })}
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