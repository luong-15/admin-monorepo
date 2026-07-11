"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageCircle,
  Send,
  X,
  Bot,
  User,
  Camera,
  Sparkles,
  Paperclip,
} from "lucide-react";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  images?: string[];
}

interface ChatAssistantProps {
  products: Product[];
}

// Helper: Xử lý hiển thị Markdown đơn giản cho Chatbot
const MessageContent = ({ content }: { content: string }) => {
  const parseMarkdown = (text: string) => {
    return text.split("\n").map((line, i) => {
      // Bold text
      let processed = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-primary">$1</strong>');
      // Italic
      processed = processed.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
      // Bullet points
      if (line.trim().startsWith("-") || line.trim().startsWith("•")) {
        return (
          <li key={i} className="ml-4 list-disc marker:text-blue-500 py-0.5">
            <span dangerouslySetInnerHTML={{ __html: processed.replace(/^[-•]\s*/, "") }} />
          </li>
        );
      }
      return <p key={i} className="min-h-[1.2em]" dangerouslySetInnerHTML={{ __html: processed }} />;
    });
  };

  return <div className="space-y-1 text-sm leading-relaxed">{parseMarkdown(content)}</div>;
};

export function ChatAssistant({ products }: ChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Xin chào! 👋 Tôi là trợ lý TechNova. Tôi có thể giúp bạn tìm kiếm linh kiện hoặc giải đáp thắc mắc kỹ thuật đấy!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const scrollEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isLoading, isOpen]);

  const handleSendMessage = async () => {
    if ((!input.trim() && selectedImages.length === 0) || isLoading) return;

    const userImages = selectedImages.map((file) => URL.createObjectURL(file));
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
      images: userImages.length > 0 ? userImages : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSelectedImages([]);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("messages", JSON.stringify([
        ...messages.map((msg) => ({ role: msg.role, content: msg.content })),
        { role: "user", content: userMessage.content },
      ]));
      formData.append("products", JSON.stringify(products));
      selectedImages.forEach((file) => formData.append("images", file));

      const response = await fetch("/api/chat", { method: "POST", body: formData });
      if (!response.ok) throw new Error();

      const data = await response.json();
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      }]);
    } catch (error) {
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Hệ thống đang bận một chút, bạn thử lại sau giây lát nhé! 🛠️",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <motion.div 
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            className="fixed bottom-6 right-6 z-100"
        >
          <Button
            onClick={() => setIsOpen(true)}
            className="h-14 w-14 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-primary hover:bg-primary/90 text-primary-foreground group"
          >
            <MessageCircle className="h-6 w-6 transition-transform group-hover:scale-110" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-background"></span>
            </span>
          </Button>
        </motion.div>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-0 right-0 z-100 w-full sm:bottom-6 sm:right-6 sm:w-105 h-dvh sm:h-162.5"
          >
            <Card className="w-full h-full shadow-2xl flex flex-col gap-0 border-border/50 bg-background/95 backdrop-blur-xl sm:rounded-3xl overflow-hidden">
              {/* Header */}
              <CardHeader className="bg-primary/5 border-b p-5 shrink-0 gap-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                      <Bot size={22} />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold tracking-tight">TechNova Assistant</CardTitle>
                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-500 font-medium uppercase tracking-wider">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          AI Ready
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full hover:bg-destructive/10 hover:text-destructive">
                    <X size={20} />
                  </Button>
                </div>
              </CardHeader>

              {/* Chat View */}
              <CardContent className="flex-1 overflow-hidden p-0 flex flex-col bg-muted/20">
                <ScrollArea className="flex-1 min-h-0 overflow-hidden overscroll-contain">
                  <div className="p-5 space-y-6">
                    {messages.map((message) => (
                      <div key={message.id} className={cn("flex flex-col", message.role === "user" ? "items-end" : "items-start")}>
                        <div className={cn("flex gap-3 max-w-[85%]", message.role === "user" && "flex-row-reverse")}>
                          <div className={cn(
                            "h-8 w-8 rounded-xl flex items-center justify-center shrink-0 border shadow-sm",
                            message.role === "assistant" ? "bg-background text-primary border-primary/10" : "bg-primary text-primary-foreground border-transparent"
                          )}>
                            {message.role === "assistant" ? <Sparkles size={14} /> : <User size={14} />}
                          </div>
                          
                          <div className="flex flex-col gap-1.5">
                            <div className={cn(
                              "px-4 py-3 shadow-sm",
                              message.role === "user" 
                                ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-none" 
                                : "bg-background border rounded-2xl rounded-tl-none"
                            )}>
                              {message.images && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {message.images.map((img, i) => (
                                    <img key={i} src={img} alt="attached" className="w-24 h-24 object-cover rounded-xl border border-white/20" />
                                  ))}
                                </div>
                              )}
                              <MessageContent content={message.content} />
                            </div>
                            <span className="text-[10px] text-muted-foreground font-medium px-1">
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex items-center gap-2 text-muted-foreground px-12">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                          <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Đang phân tích</span>
                      </div>
                    )}
                    <div ref={scrollEndRef} />
                  </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="px-4 pt-4 bg-background border-t">
                  <AnimatePresence>
                    {selectedImages.length > 0 && (
                      <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="flex gap-2 overflow-x-auto pb-3">
                        {selectedImages.map((file, i) => (
                          <div key={i} className="relative group shrink-0">
                            <img src={URL.createObjectURL(file)} className="w-14 h-14 object-cover rounded-xl border" alt="preview" />
                            <button onClick={() => setSelectedImages(p => p.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 bg-destructive text-primary-foreground rounded-full p-1 shadow-lg scale-0 group-hover:scale-100 transition-transform">
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="relative flex items-center bg-muted/50 rounded-3xl border border-border/50 focus-within:border-primary/50 focus-within:bg-background transition-all p-2 pr-3">
                    <input type="file" ref={fileInputRef} hidden accept="image/*" multiple onChange={(e) => setSelectedImages(Array.from(e.target.files || []))} />
                    <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} className="rounded-full h-10 w-10 text-muted-foreground hover:text-primary shrink-0">
                      <Camera size={20} />
                    </Button>
                    
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}}
                      placeholder="Hỏi TechNova..."
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-2 resize-none max-h-32 min-h-10 outline-none"
                      rows={1}
                    />

                    <Button 
                        onClick={handleSendMessage} 
                        disabled={(!input.trim() && selectedImages.length === 0) || isLoading}
                        className="rounded-full h-10 w-10 p-0 shrink-0 shadow-lg shadow-primary/20"
                    >
                      <Send size={18} />
                    </Button>
                  </div>
                  <p className="text-[9px] text-center text-muted-foreground mt-3 font-medium uppercase tracking-tighter opacity-50">AI có thể nhầm lẫn. Hãy kiểm tra lại thông tin quan trọng.</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}