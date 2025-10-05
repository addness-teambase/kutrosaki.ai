"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { ConversationList } from "./conversation-list";
import { ChatInterface } from "./chat-interface";

interface ChatWithSidebarProps {
    conversationId: string;
    initialMessages: Array<{
        id: string;
        role: "user" | "assistant";
        content: string;
    }>;
    conversations: Array<{
        id: string;
        title: string;
        updated_at: string;
    }>;
}

export function ChatWithSidebar({
    conversationId,
    initialMessages,
    conversations: initialConversations,
}: ChatWithSidebarProps) {
    const router = useRouter();
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [conversations, setConversations] = useState(initialConversations);

    const handleNewChat = () => {
        router.push("/");
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
                // リアルタイムで会話リストから削除
                setConversations(prev => prev.filter(c => c.id !== convId));
                // 削除した会話が現在表示中の場合はホームに戻る
                if (convId === conversationId) {
                    router.push("/");
                }
            }
        } catch (error) {
            console.error("Error deleting conversation:", error);
        } finally {
            setDeletingId(null);
        }
    };

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

    return (
        <div className="flex h-screen overflow-hidden relative">
            <ConversationList conversations={conversations} />

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

            <div className="flex-1 overflow-hidden">
                <ChatInterface
                    conversationId={conversationId}
                    initialMessages={initialMessages}
                    onOpenSidebar={() => setIsMobileSidebarOpen(true)}
                />
            </div>
        </div>
    );
}

