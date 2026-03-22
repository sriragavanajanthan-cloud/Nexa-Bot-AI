import { useState } from "react";
import { MessageSquare, Brain, Languages, ImageIcon, Wand2, BarChart2, Zap, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import MemoryBank from "./MemoryBank";
import LanguageTranslator from "./LanguageTranslator";
import ImageVideoGenerator from "./ImageVideoGenerator";
import ImageEditor from "./ImageEditor";
import GraphingTool from "./GraphingTool";
import ImageAmplifier from "./ImageAmplifier";

const TOOLS = [
  { id: "memory", label: "Memory Bank", icon: Brain, color: "text-red-400" },
  { id: "translate", label: "Translator", icon: Languages, color: "text-orange-400" },
  { id: "imagegen", label: "Image Generator", icon: ImageIcon, color: "text-yellow-400" },
  { id: "imageedit", label: "Image Editor", icon: Wand2, color: "text-green-400" },
  { id: "graph", label: "Graphing", icon: BarChart2, color: "text-blue-400" },
  { id: "amplify", label: "Image Amplifier", icon: Zap, color: "text-purple-400" },
];

const TOOL_COMPONENTS = {
  memory: MemoryBank,
  translate: LanguageTranslator,
  imagegen: ImageVideoGenerator,
  imageedit: ImageEditor,
  graph: GraphingTool,
  amplify: ImageAmplifier,
};

export default function ToolsPanel({ onClose }) {
  const [activeTool, setActiveTool] = useState(null);

  const ActiveComponent = activeTool ? TOOL_COMPONENTS[activeTool] : null;

  return (
    <div className="flex h-full bg-[#0d0d0d] border-l border-white/10" style={{ width: 380 }}>
      {/* Tool List */}
      {!activeTool && (
        <div className="flex flex-col w-full">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="text-white font-bold text-sm">AI Tools</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="w-7 h-7 text-white/40 hover:text-white hover:bg-white/10">
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex-1 p-3 space-y-1">
            {TOOLS.map(tool => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/8 transition-colors text-left group"
                >
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                    <Icon className={cn("w-4 h-4", tool.color)} />
                  </div>
                  <span className="text-white/80 text-sm font-medium flex-1">{tool.label}</span>
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Tool */}
      {activeTool && ActiveComponent && (
        <div className="flex flex-col w-full overflow-hidden">
          <div className="flex items-center gap-2 p-3 border-b border-white/10">
            <Button variant="ghost" size="icon" onClick={() => setActiveTool(null)} className="w-7 h-7 text-white/40 hover:text-white hover:bg-white/10">
              <ChevronRight className="w-4 h-4 rotate-180" />
            </Button>
            <span className="text-white/60 text-sm flex-1">{TOOLS.find(t => t.id === activeTool)?.label}</span>
            <Button variant="ghost" size="icon" onClick={onClose} className="w-7 h-7 text-white/40 hover:text-white hover:bg-white/10">
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ActiveComponent />
          </div>
        </div>
      )}
    </div>
  );
}