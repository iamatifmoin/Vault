"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GraduationCap, Loader2, Lock, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { DIFFICULTY_LABELS } from "@/lib/constants";
import type { Difficulty } from "@/types";

const PRO_STORAGE_KEY = "vault_pro";

interface TeachMessage {
  role: "user" | "assistant";
  content: string;
}

interface TeachDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  problem: {
    title: string;
    difficulty: Difficulty;
    topics: string[];
  };
}

function buildOpeningMessage(title: string) {
  return `I see you're working on ${title}. What have you tried so far?`;
}

async function streamAssistantResponse(
  problem: TeachDialogProps["problem"],
  messages: TeachMessage[],
  onDelta: (text: string) => void,
) {
  const response = await fetch("/api/teach", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ problem, messages }),
  });

  if (!response.ok) {
    let errorMessage = "Unable to reach the mentor right now.";
    try {
      const payload = (await response.json()) as { error?: string };
      if (payload.error) {
        errorMessage = payload.error;
      }
    } catch {
      // Response body may not be JSON when streaming fails early.
    }
    throw new Error(errorMessage);
  }

  if (!response.body) {
    throw new Error("Streaming response unavailable.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    const chunk = decoder.decode(value, { stream: true });
    if (chunk) {
      onDelta(chunk);
    }
  }
}

export function TeachDialog({ open, onOpenChange, problem }: TeachDialogProps) {
  const [isPro, setIsPro] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<TeachMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [openingComplete, setOpeningComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resetSession = useCallback(() => {
    setMessages([]);
    setDraft("");
    setIsStreaming(false);
    setOpeningComplete(false);
  }, []);

  useEffect(() => {
    setIsPro(window.localStorage.getItem(PRO_STORAGE_KEY) === "true");
  }, []);

  useEffect(() => {
    if (!open) {
      resetSession();
      return;
    }

    if (isPro !== true) {
      return;
    }

    const openingMessage = buildOpeningMessage(problem.title);
    let index = 0;
    setMessages([{ role: "assistant", content: "" }]);
    setOpeningComplete(false);

    const intervalId = window.setInterval(() => {
      index += 1;
      setMessages([{ role: "assistant", content: openingMessage.slice(0, index) }]);

      if (index >= openingMessage.length) {
        window.clearInterval(intervalId);
        setOpeningComplete(true);
      }
    }, 18);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [open, isPro, problem.title, resetSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  async function sendMessage() {
    const trimmed = draft.trim();
    if (!trimmed || isStreaming || !openingComplete) {
      return;
    }

    const nextMessages: TeachMessage[] = [
      ...messages,
      { role: "user", content: trimmed },
      { role: "assistant", content: "" },
    ];

    setMessages(nextMessages);
    setDraft("");
    setIsStreaming(true);

    try {
      await streamAssistantResponse(
        problem,
        nextMessages.slice(0, -1),
        (delta) => {
          setMessages((current) => {
            const updated = [...current];
            const lastIndex = updated.length - 1;
            const lastMessage = updated[lastIndex];

            if (lastMessage?.role === "assistant") {
              updated[lastIndex] = {
                ...lastMessage,
                content: lastMessage.content + delta,
              };
            }

            return updated;
          });
        },
      );
    } catch (error) {
      setMessages((current) => current.slice(0, -1));
      toast.error(
        error instanceof Error ? error.message : "Unable to send your message.",
      );
    } finally {
      setIsStreaming(false);
      textareaRef.current?.focus();
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col overflow-hidden sm:max-w-2xl">
        {isPro === null ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
          </div>
        ) : !isPro ? (
          <>
            <DialogHeader>
              <DialogTitle>Pro Feature</DialogTitle>
              <DialogDescription>
                Teach Me This is a Pro feature. Upgrade for ₹299/month.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 px-6 pb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800">
                <Lock className="h-5 w-5 text-zinc-400" />
              </div>
              <Button type="button" disabled className="min-w-[160px]">
                Upgrade (Coming Soon)
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
                  <GraduationCap className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="min-w-0">
                  <DialogTitle>Let&apos;s work through this together</DialogTitle>
                  <DialogDescription className="truncate">
                    {problem.title} · {DIFFICULTY_LABELS[problem.difficulty]}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="flex min-h-0 flex-1 flex-col px-6 pb-6">
              <div className="min-h-[280px] flex-1 space-y-4 overflow-y-auto pr-1">
                {messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={cn(
                      "max-w-[85%] text-sm leading-6",
                      message.role === "user"
                        ? "ml-auto rounded-lg bg-zinc-800 px-4 py-3 text-white"
                        : "border-l-2 border-emerald-500/50 py-1 pl-4 text-zinc-300",
                    )}
                  >
                    {message.content}
                    {message.role === "assistant" &&
                    isStreaming &&
                    index === messages.length - 1 ? (
                      <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-emerald-500 align-middle" />
                    ) : null}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="mt-4 flex items-end gap-2 border-t border-zinc-700 pt-4">
                <textarea
                  ref={textareaRef}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Share what you've tried so far..."
                  rows={2}
                  disabled={isStreaming || !openingComplete}
                  className="min-h-[72px] flex-1 resize-none rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500 focus-visible:border-zinc-600 focus-visible:ring-2 focus-visible:ring-zinc-600/40 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <Button
                  type="button"
                  onClick={() => void sendMessage()}
                  disabled={isStreaming || !openingComplete || !draft.trim()}
                  className="h-10 shrink-0"
                >
                  {isStreaming ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="mr-1.5 h-4 w-4" />
                      Send
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function TeachMeButton({
  problem,
}: {
  problem: {
    title: string;
    difficulty: Difficulty;
    topics: string[];
  };
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        <GraduationCap className="mr-2 h-4 w-4" />
        Teach Me This
      </Button>
      <TeachDialog open={open} onOpenChange={setOpen} problem={problem} />
    </>
  );
}
