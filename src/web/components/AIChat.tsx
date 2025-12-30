import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { 
  MessageCircle, 
  X, 
  Send, 
  Loader2, 
  Sparkles,
  Bot,
  User,
  Wrench
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Project, ProjectCategory, CalculatorResult, CategoryType } from '@/lib/types';
import type { ModifyEstimateToolResult } from '../../api/agent/modify-estimate-tool';

interface AIChatProps {
  project: Project;
  onModifyEstimate: (modification: {
    action: string;
    category: CategoryType;
    itemIndex?: number;
    item?: {
      description: string;
      quantity: number;
      unit: string;
      unitPrice: number;
      laborHours: number;
      laborRate: number;
    };
    reason: string;
  }) => void;
}

function ModifyEstimateTool({ tool }: { tool: ModifyEstimateToolResult }) {
  if (tool.state !== "output-available") {
    return (
      <div className="flex items-center gap-2 p-2 bg-violet-500/10 rounded-lg text-sm text-violet-300">
        <Loader2 className="w-3 h-3 animate-spin" />
        Updating estimate...
      </div>
    );
  }
  
  const output = tool.output as { success: boolean; message: string };
  
  return (
    <div className="flex items-center gap-2 p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-sm">
      <Wrench className="w-3 h-3 text-emerald-400" />
      <span className="text-emerald-300">{output.message}</span>
    </div>
  );
}

function MessagePart({ part, onModify }: { 
  part: UIMessage["parts"][number];
  onModify?: (mod: ModifyEstimateToolResult['args']) => void;
}) {
  if (part.type === "text") {
    return <span className="whitespace-pre-wrap">{part.text}</span>;
  }
  
  if (part.type === "tool-modify_estimate") {
    const toolPart = part as unknown as ModifyEstimateToolResult;
    
    // Trigger the modification when tool completes
    useEffect(() => {
      if (toolPart.state === "output-available" && onModify) {
        onModify(toolPart.args);
      }
    }, [toolPart.state]);
    
    return <ModifyEstimateTool tool={toolPart} />;
  }
  
  return null;
}

export function AIChat({ project, onModifyEstimate }: AIChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ 
      api: "/api/chat/messages",
      body: {
        projectContext: {
          address: project.propertyAddress,
          categories: project.categories,
          total: project.total,
        }
      }
    }),
  });
  
  const isLoading = status === "streaming" || status === "submitted";
  const [input, setInput] = useState("");

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  };

  const handleModification = (mod: ModifyEstimateToolResult['args']) => {
    onModifyEstimate({
      action: mod.action,
      category: mod.category,
      itemIndex: mod.itemIndex,
      item: mod.item,
      reason: mod.reason,
    });
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 p-4 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all hover:scale-105 ${
          isOpen ? 'hidden' : ''
        }`}
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Panel */}
      <div
        className={`fixed bottom-0 right-0 z-50 transition-all duration-300 ${
          isOpen 
            ? 'translate-y-0 opacity-100' 
            : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="w-full sm:w-[400px] h-[500px] sm:h-[600px] sm:m-4 bg-slate-900 border border-slate-700 sm:rounded-xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between bg-gradient-to-r from-violet-900/50 to-fuchsia-900/50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-violet-500/20">
                <Sparkles className="w-4 h-4 text-violet-400" />
              </div>
              <div>
                <h3 className="font-medium text-white text-sm">AI Assistant</h3>
                <p className="text-xs text-slate-400">Refine your estimate</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearChat}
                className="text-slate-400 hover:text-white h-8 px-2"
              >
                Clear
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="text-slate-400 hover:text-white h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-violet-500/10 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-violet-400" />
                </div>
                <p className="text-slate-400 text-sm mb-2">AI Assistant Ready</p>
                <p className="text-slate-500 text-xs max-w-[250px] mx-auto">
                  Ask questions about your estimate or request changes like "Add painting to the estimate" or "What if the roof is 25 years old?"
                </p>
              </div>
            )}
            
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-violet-400" />
                  </div>
                )}
                
                <div 
                  className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                    message.role === 'user'
                      ? 'bg-sky-600 text-white rounded-br-sm'
                      : 'bg-slate-800 text-slate-200 rounded-bl-sm'
                  }`}
                >
                  {message.parts.map((part, i) => (
                    <MessagePart 
                      key={i} 
                      part={part} 
                      onModify={message.role === 'assistant' ? handleModification : undefined}
                    />
                  ))}
                </div>
                
                {message.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-sky-500/20 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-sky-400" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-violet-400" />
                </div>
                <div className="px-3 py-2 rounded-lg bg-slate-800 text-slate-400 text-sm rounded-bl-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-slate-700 bg-slate-800/50">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your estimate..."
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder:text-slate-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-violet-600 hover:bg-violet-700 text-white px-3"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 sm:hidden"
          onClick={handleClose}
        />
      )}
    </>
  );
}
