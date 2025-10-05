import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        // メッセージを削除
        await supabase.from("messages").delete().eq("conversation_id", id);

        // 会話を削除
        const { error } = await supabase
            .from("conversations")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error deleting conversation:", error);
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error in DELETE /api/conversations/[id]:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

