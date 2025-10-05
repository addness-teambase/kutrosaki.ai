"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { ThemeSwitcher } from "./theme-switcher";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Conversation {
    id: string;
    title: string;
    updated_at: string;
}

interface ConversationListProps {
    conversations: Conversation[];
    userId: string;
}

export function ConversationList({ conversations, userId }: ConversationListProps) {
    const router = useRouter();
    const [isCreating, setIsCreating] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isCollapsed, setIsCollapsed] = useState(false);

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
                router.push("/");
                router.refresh();
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
        <div className={`hidden md:flex border-r bg-background flex-col h-full transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
            {/* Header */}
            <div className="p-4 border-b space-y-3">
                <div className="flex items-center justify-between">
                    {!isCollapsed && (
                        <Link href="/" className="text-xl font-bold hover:opacity-70 transition-opacity">
                            黒崎AI
                        </Link>
                    )}
                    <div className="flex items-center gap-2">
                        {!isCollapsed && <ThemeSwitcher />}
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="p-2 hover:bg-muted rounded transition-colors"
                            title={isCollapsed ? "サイドバーを開く" : "サイドバーを閉じる"}
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className={`transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
                            >
                                <path d="M15 18l-6-6 6-6" />
                            </svg>
                        </button>
                    </div>
                </div>
                {!isCollapsed && (
                    <Button
                        onClick={handleNewChat}
                        disabled={isCreating}
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
                )}
                {isCollapsed && (
                    <Button
                        onClick={handleNewChat}
                        disabled={isCreating}
                        variant="default"
                        size="icon"
                        className="w-full"
                        title="新しいチャット"
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </Button>
                )}
            </div>

            {/* Conversations */}
            {!isCollapsed && (
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
            )}

            {/* Footer */}
            <div className="p-4 border-t">
                {!isCollapsed ? (
                    <Button asChild variant="ghost" className="w-full justify-start gap-2">
                        <Link href="/auth/login">
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
                ) : (
                    <Button asChild variant="ghost" size="icon" className="w-full" title="アカウント">
                        <Link href="/auth/login">
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
                    </Button>
                )}
            </div>
        </div>
    );
}

