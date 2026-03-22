import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { File } from "lucide-react";

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3 mb-4", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-green-400 flex items-center justify-center shrink-0 mt-1">
          <span className="text-black text-xs font-bold">N</span>
        </div>
      )}
      <div className={cn(
        "max-w-[75%] rounded-2xl px-4 py-3 text-sm",
        isUser
          ? "bg-gradient-to-br from-cyan-500/20 to-green-400/20 border border-cyan-500/30 text-white"
          : "bg-[#1a1a1a] border border-white/10 text-white/90"
      )}>
        {message.file_urls?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {message.file_urls.map((url, i) => {
              const isImage = /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(url);
              return isImage ? (
                <img key={i} src={url} alt="attachment" className="max-h-40 rounded-lg object-cover border border-white/10" />
              ) : (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-white/10 rounded-lg px-2 py-1 text-xs text-cyan-300 hover:text-cyan-200">
                  <File className="w-3 h-3" /> View File
                </a>
              );
            })}
          </div>
        )}
        {isUser ? (
          <p className="leading-relaxed">{message.content}</p>
        ) : (
          <ReactMarkdown
            className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
            components={{
              code: ({ inline, children, ...props }) =>
                inline ? (
                  <code className="px-1.5 py-0.5 rounded bg-white/10 text-cyan-300 text-xs" {...props}>{children}</code>
                ) : (
                  <pre className="bg-black/50 rounded-lg p-3 overflow-x-auto my-2 border border-white/10">
                    <code className="text-green-300 text-xs" {...props}>{children}</code>
                  </pre>
                ),
              p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="my-1 ml-4 list-disc">{children}</ul>,
              ol: ({ children }) => <ol className="my-1 ml-4 list-decimal">{children}</ol>,
              li: ({ children }) => <li className="my-0.5">{children}</li>,
              h1: ({ children }) => <h1 className="text-lg font-bold my-2 text-white">{children}</h1>,
              h2: ({ children }) => <h2 className="text-base font-bold my-2 text-white">{children}</h2>,
              h3: ({ children }) => <h3 className="text-sm font-bold my-2 text-white">{children}</h3>,
              strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
              a: ({ children, ...props }) => <a className="text-cyan-400 underline" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
        <p className="text-white/30 text-xs mt-1">
          {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
        </p>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-1">
          <span className="text-white/70 text-xs font-bold">You</span>
        </div>
      )}
    </div>
  );
}