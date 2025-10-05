import { NextRequest, NextResponse } from "next/server";
import { createConversation } from "@/lib/database";

export async function POST(request: NextRequest) {
    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json(
                { error: "ユーザーIDが必要です" },
                { status: 400 }
            );
        }

        const conversation = await createConversation(userId);

        if (!conversation) {
            return NextResponse.json(
                { error: "会話の作成に失敗しました" },
                { status: 500 }
            );
        }

        return NextResponse.json(conversation);
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { error: "サーバーエラーが発生しました" },
            { status: 500 }
        );
    }
}

