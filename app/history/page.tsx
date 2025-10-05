import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ConversationList } from "@/components/conversation-list";
import { getConversations } from "@/lib/database";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const conversations = await getConversations(user.id);

  return (
    <div className="flex h-screen">
      <ConversationList conversations={conversations} userId={user.id} />
      <div className="flex-1 flex flex-col items-center justify-center bg-muted/30">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">チャット履歴</h1>
          <p className="text-muted-foreground">
            左側から会話を選択してください
          </p>
          <Button asChild>
            <Link href="/">ホームに戻る</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

