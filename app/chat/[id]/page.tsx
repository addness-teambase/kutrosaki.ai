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

  return (
    <ChatWithSidebar
      conversationId={id}
      initialMessages={messages}
      conversations={conversations}
      userId={user.id}
    />
  );
}

