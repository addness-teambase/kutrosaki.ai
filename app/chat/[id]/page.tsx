import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ChatInterface } from "@/components/chat-interface";
import { getMessages } from "@/lib/database";

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    const { id } = await params;
    const messages = await getMessages(id);

    return <ChatInterface conversationId={id} initialMessages={messages} />;
}

