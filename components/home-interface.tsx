"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { ConversationList } from "./conversation-list";
import { ThemeSwitcher } from "./theme-switcher";

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
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 会話一覧を取得
    fetch(`/api/conversations?userId=${userId}`)
      .then(res => res.json())
      .then(data => setConversations(data))
      .catch(err => console.error(err));
  }, [userId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "今日";
    if (days === 1) return "昨日";
    if (days < 7) return `${days}日前`;
    return date.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
  };

  const handleNewChat = async () => {
    // 入力フィールドをクリアしてホームにリセット
    setInput("");
    router.refresh();
  };

  const handleDeleteConversation = async (e: React.MouseEvent, convId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm("この会話を削除しますか？")) return;

    setDeletingId(convId);
    try {
      const response = await fetch(`/api/conversations/${convId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // 会話一覧を再取得
        const res = await fetch(`/api/conversations?userId=${userId}`);
        const data = await res.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    } finally {
      setDeletingId(null);
    }
  };

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

      <div className="flex-1 flex flex-col bg-background overflow-hidden">
        {/* モバイルヘッダー */}
        <div className="md:hidden fixed top-0 left-0 right-0 bg-background border-b z-50 h-14">
          <div className="flex items-center justify-between h-full px-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="flex items-center justify-center h-9 w-9 hover:bg-muted rounded-lg transition-colors"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <Link href="/" className="text-lg font-bold hover:opacity-70 transition-opacity">
              黒崎AI
            </Link>
            <div className="flex items-center gap-2">
              <ThemeSwitcher />
              <Link href="/protected" className="flex items-center justify-center h-9 w-9 hover:bg-muted rounded-lg transition-colors">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* モバイルサイドバー */}
        {isMobileSidebarOpen && (
          <>
            {/* オーバーレイ */}
            <div
              className="md:hidden fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsMobileSidebarOpen(false)}
            />

            {/* サイドバー本体 */}
            <div className="md:hidden fixed top-0 left-0 bottom-0 w-64 bg-background z-50 flex flex-col shadow-lg">
              {/* ヘッダー */}
              <div className="p-4 border-b space-y-3">
                <div className="flex items-center justify-between">
                  <Link href="/" className="text-xl font-bold hover:opacity-70 transition-opacity">
                    黒崎AI
                  </Link>
                  <button
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="p-2 hover:bg-muted rounded transition-colors"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                <Button
                  onClick={() => {
                    setIsMobileSidebarOpen(false);
                    handleNewChat();
                  }}
                  disabled={isCreatingNew}
                  variant="default"
                  className="w-full justify-start gap-2"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  新しいチャット
                </Button>
              </div>

              {/* 会話一覧 */}
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    まだ会話がありません
                  </div>
                ) : (
                  <div className="divide-y">
                    {conversations.map((conv) => (
                      <div key={conv.id} className="relative group">
                        <Link
                          href={`/chat/${conv.id}`}
                          onClick={() => setIsMobileSidebarOpen(false)}
                          className="block px-4 py-3 pr-12 hover:bg-muted transition-colors"
                        >
                          <div className="font-medium truncate text-sm">{conv.title}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatDate(conv.updated_at)}
                          </div>
                        </Link>
                        <button
                          onClick={(e) => handleDeleteConversation(e, conv.id)}
                          disabled={deletingId === conv.id}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 rounded transition-all"
                          title="削除"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-destructive"
                          >
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* フッター */}
              <div className="p-4 border-t">
                <Button asChild variant="ghost" className="w-full justify-start gap-2">
                  <Link href="/protected">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    アカウント
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}

        {/* モバイル: ホーム画面（デスクトップと同じ） */}
        <div className="md:hidden flex-1 flex flex-col pt-14">
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="w-full max-w-2xl space-y-6">
              <div className="text-center space-y-3">
                <h2 className="text-2xl font-medium">
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
                  className="w-full h-12 pr-12 text-sm rounded-full border-2"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-8 w-8"
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
                  >
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </Button>
              </div>
            </div>
          </div>

        </div>

        {/* デスクトップ: 通常のホーム画面 */}
        <div className="hidden md:flex flex-1 items-center justify-center px-4">
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

