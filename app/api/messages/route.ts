import { NextRequest, NextResponse } from "next/server";
import { saveMessage } from "@/lib/database";

export async function POST(request: NextRequest) {
    try {
        const { conversationId, role, content } = await request.json();

        if (!conversationId || !role || !content) {
            return NextResponse.json(
                { error: "必須パラメータが不足しています" },
                { status: 400 }
            );
        }

        const message = await saveMessage(conversationId, role, content);

        if (!message) {
            return NextResponse.json(
                { error: "メッセージの保存に失敗しました" },
                { status: 500 }
            );
        }

        return NextResponse.json(message);
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { error: "サーバーエラーが発生しました" },
            { status: 500 }
        );
    }
}

