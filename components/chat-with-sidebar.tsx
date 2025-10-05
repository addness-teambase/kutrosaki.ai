"use client";

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
    userId: string;
}

export function ChatWithSidebar({
    conversationId,
    initialMessages,
    conversations,
    userId,
}: ChatWithSidebarProps) {
    return (
        <div className="flex h-screen">
            <ConversationList conversations={conversations} userId={userId} />
            <div className="flex-1">
                <ChatInterface
                    conversationId={conversationId}
                    initialMessages={initialMessages}
                />
            </div>
        </div>
    );
}

