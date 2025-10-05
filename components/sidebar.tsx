"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { ThemeSwitcher } from "./theme-switcher";
import Link from "next/link";

interface Conversation {
    id: string;
    title: string;
    date: string;
}

export function Sidebar() {
    const [conversations] = useState<Conversation[]>([
        { id: "1", title: "新しいチャット", date: "今日" },
    ]);

    return (
        <div className="w-64 border-r bg-muted/30 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b">
                <Button variant="outline" className="w-full justify-start gap-2">
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
            <div className="flex-1 overflow-y-auto p-2">
                <div className="space-y-1">
                    {conversations.map((conv) => (
                        <button
                            key={conv.id}
                            className="w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm"
                        >
                            <div className="font-medium truncate">{conv.title}</div>
                            <div className="text-xs text-muted-foreground">{conv.date}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t space-y-2">
                <div className="flex items-center justify-between">
                    <ThemeSwitcher />
                    <Button asChild variant="ghost" size="icon">
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
                </div>
            </div>
        </div>
    );
}

