"use client";

import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { ConversationList } from "./conversation-list";

interface HomeInterfaceProps {
    userId: string;
}

interface Conversation {
    id: string;
    title: string;
    updated_at: string;
}

export function HomeInterface({ userId }: HomeInterfaceProps) {
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const router = useRouter();

    useEffect(() => {
        // 会話一覧を取得
        fetch(`/api/conversations?userId=${userId}`)
            .then(res => res.json())
            .then(data => setConversations(data))
            .catch(err => console.error(err));
    }, [userId]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        setIsLoading(true);
        try {
            // 新しい会話を作成
            const response = await fetch("/api/conversations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId }),
            });

            const data = await response.json();
            if (response.ok && data.id) {
                // 新しいチャットページに移動して、最初のメッセージを含める
                router.push(`/chat/${data.id}?initialMessage=${encodeURIComponent(input)}`);
            }
        } catch (error) {
            console.error("Error creating conversation:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

  return (
    <div className="flex h-screen overflow-hidden">
      <ConversationList conversations={conversations} userId={userId} />
      
      <div className="flex-1 flex flex-col bg-background pt-14 md:pt-0">
        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-2xl space-y-6 md:space-y-8">
            <div className="text-center space-y-3 md:space-y-4">
              <h2 className="text-2xl md:text-4xl font-medium">
                お手伝いできることはありますか？
              </h2>
            </div>

            <div className="relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="質問してみましょう"
                disabled={isLoading}
                className="w-full h-12 md:h-14 pr-12 md:pr-14 text-sm md:text-base rounded-full border-2"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-8 w-8 md:h-10 md:w-10"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="md:w-[18px] md:h-[18px]"
                >
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

