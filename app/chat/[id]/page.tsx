import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ChatWithSidebar } from "@/components/chat-with-sidebar";
import { getMessages, getConversations } from "@/lib/database";

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    const { id } = await params;
    const messages = await getMessages(id);
    const conversations = await getConversations(user.id);

    // 最初のAIメッセージを除外（「お手伝いできることはありますか？」など）
    const filteredMessages = messages.filter((msg, index) => {
        // 最初のメッセージがAIからのものなら除外
        if (index === 0 && msg.role === "assistant") {
            return false;
        }
        return true;
    });

    return (
        <ChatWithSidebar
            conversationId={id}
            initialMessages={filteredMessages}
            conversations={conversations}
            userId={user.id}
        />
    );
}

