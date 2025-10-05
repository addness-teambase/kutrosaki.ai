import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ConversationList } from "@/components/conversation-list";
import { getConversations } from "@/lib/database";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const conversations = await getConversations(user.id);

  return (
    <div className="flex h-screen">
      <ConversationList conversations={conversations} userId={user.id} />
      <div className="flex-1 flex items-center justify-center bg-muted/30">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Kurosaki AI</h1>
          <p className="text-muted-foreground">
            会話を選択するか、新しいチャットを開始してください
          </p>
        </div>
      </div>
    </div>
  );
}
