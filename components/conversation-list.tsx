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

    const handleNewChat = async () => {
        setIsCreating(true);
        try {
            const response = await fetch("/api/conversations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId }),
            });

            const data = await response.json();
            if (response.ok && data.id) {
                router.push(`/chat/${data.id}`);
                router.refresh();
            }
        } catch (error) {
            console.error("Error creating conversation:", error);
        } finally {
            setIsCreating(false);
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
        <>
            {/* Mobile Header - スマホのみ表示 */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-background border-b z-50">
                <div className="flex items-center justify-between p-3">
                    <h2 className="text-lg font-bold">黒崎AI</h2>
                    <div className="flex items-center gap-2">
                        <ThemeSwitcher />
                        <Button
                            onClick={handleNewChat}
                            disabled={isCreating}
                            size="sm"
                            className="h-8"
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
                        </Button>
                    </div>
                </div>
            </div>

            {/* Desktop Sidebar - デスクトップのみ表示 */}
            <div className="hidden md:flex w-64 border-r bg-background flex-col h-full">
                {/* Header */}
                <div className="p-4 border-b space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">黒崎AI</h2>
                        <ThemeSwitcher />
                    </div>
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
                </div>

                {/* Conversations */}
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground text-sm">
                            まだ会話がありません
                        </div>
                    ) : (
                        <div className="divide-y">
                            {conversations.map((conv) => (
                                <Link
                                    key={conv.id}
                                    href={`/chat/${conv.id}`}
                                    className="block px-4 py-3 hover:bg-muted transition-colors"
                                >
                                    <div className="font-medium truncate text-sm">{conv.title}</div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {formatDate(conv.updated_at)}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t">
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
                </div>
            </div>
        </>
    );
}

