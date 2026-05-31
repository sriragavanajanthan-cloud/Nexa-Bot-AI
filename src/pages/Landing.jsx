import { useNavigate } from 'react-router-dom';
import { Sparkles, Video, Image, MessageCircle, Shield, Brain } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a]">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-cyan-500 to-green-500 flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-black" />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent mb-4">
          NEXAbot.AI
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
          Your all-in-one AI workspace for chat, video generation, image creation, and more.
        </p>
        
        <button
          onClick={() => navigate('/login')}
          className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-green-500 rounded-xl font-semibold text-black hover:opacity-90 transition-all text-lg"
        >
          Get Started →
        </button>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Features</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { icon: MessageCircle, title: 'Smart Chat', desc: 'AI-powered conversations' },
            { icon: Video, title: 'AI Video Studio', desc: 'Create videos with music & effects' },
            { icon: Image, title: 'Image Generation', desc: 'Create images from text' },
            { icon: Shield, title: 'AI Detector', desc: 'Detect AI-generated content' },
            { icon: Brain, title: 'Memory Bank', desc: 'Save important messages' },
            { icon: Sparkles, title: '8+ Tools', desc: 'Complete AI workspace' },
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={i} className="bg-white/5 rounded-xl p-6 text-center border border-white/10">
                <Icon className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
