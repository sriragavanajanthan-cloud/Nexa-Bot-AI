const LOGO_URL = "https://qxgkityhhwgwohehetek.supabase.co/storage/v1/object/public/Nexa/favicon.png";

export default function Logo({ className = "w-8 h-8", showText = false }) {
  return (
    <div className="flex items-center gap-2">
      <img 
        src={LOGO_URL} 
        alt="NEXAbot.AI Logo" 
        className={`${className} object-contain rounded-lg`}
      />
      {showText && (
        <span className="font-bold text-white text-lg">NEXAbot.AI</span>
      )}
    </div>
  );
}
