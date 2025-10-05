import { createClient } from "./supabase/server";

export interface Conversation {
    id: string;
    user_id: string;
    title: string;
    created_at: string;
    updated_at: string;
}

export interface Message {
    id: string;
    conversation_id: string;
    role: "user" | "assistant";
    content: string;
    created_at: string;
}

// 会話を作成
export async function createConversation(userId: string, title: string = "新しいチャット"): Promise<Conversation | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("conversations")
        .insert({ user_id: userId, title })
        .select()
        .single();

    if (error) {
        console.error("Error creating conversation:", error);
        return null;
    }

    return data;
}

// ユーザーの会話一覧を取得
export async function getConversations(userId: string): Promise<Conversation[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

    if (error) {
        console.error("Error fetching conversations:", error);
        return [];
    }

    return data || [];
}

// 特定の会話のメッセージを取得
export async function getMessages(conversationId: string): Promise<Message[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Error fetching messages:", error);
        return [];
    }

    return data || [];
}

// メッセージを保存
export async function saveMessage(
    conversationId: string,
    role: "user" | "assistant",
    content: string
): Promise<Message | null> {
    const supabase = await createClient();

    // メッセージを保存
    const { data, error } = await supabase
        .from("messages")
        .insert({ conversation_id: conversationId, role, content })
        .select()
        .single();

    if (error) {
        console.error("Error saving message:", error);
        return null;
    }

    // 会話の更新日時を更新
    await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);

    return data;
}

// 会話のタイトルを更新
export async function updateConversationTitle(
    conversationId: string,
    title: string
): Promise<boolean> {
    const supabase = await createClient();
    const { error } = await supabase
        .from("conversations")
        .update({ title })
        .eq("id", conversationId);

    if (error) {
        console.error("Error updating conversation title:", error);
        return false;
    }

    return true;
}

// 会話を削除
export async function deleteConversation(conversationId: string): Promise<boolean> {
    const supabase = await createClient();
    const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("id", conversationId);

    if (error) {
        console.error("Error deleting conversation:", error);
        return false;
    }

    return true;
}

