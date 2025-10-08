import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { messages } = await request.json();

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "APIキーが設定されていません" },
                { status: 500 }
            );
        }

        // Gemini API用のメッセージフォーマットに変換
        const contents = messages.map((msg: { role: string; content: string }) => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }],
        }));

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    systemInstruction: {
                        parts: [
                            {
                                text: "あなたはプロフェッショナルなビジネスアシスタントです。ユーザーとの会話を始める際は、必ず相手の目的や意図を明確にするために質問をしてください。例：「本日はどのようなご用件でしょうか？」「何かお困りのことや、達成したい目標はございますか？」「具体的にどのようなサポートが必要でしょうか？」など。目的を理解した上で、効率的かつ的確なサポートを提供してください。"
                            }
                        ]
                    },
                    contents,
                    generationConfig: {
                        temperature: 1,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 8192,
                    },
                }),
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.error("Gemini API error:", error);
            return NextResponse.json(
                { error: "AIからの応答取得に失敗しました" },
                { status: response.status }
            );
        }

        const data = await response.json();
        const aiMessage = data.candidates[0].content.parts[0].text;

        return NextResponse.json({ message: aiMessage });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { error: "サーバーエラーが発生しました" },
            { status: 500 }
        );
    }
}

