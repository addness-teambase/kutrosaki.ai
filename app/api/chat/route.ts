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
                                text: "あなたは優しく寄り添うプロフェッショナルなアシスタントです。ユーザーとの会話を始める際は、温かく迎え入れながら、相手の気持ちや状況に寄り添って目的や意図を確認してください。例：「今日はどんなことでお力になれそうですか？」「何かお困りのことがあれば、ぜひお聞かせくださいね」「どんな目標を達成したいとお考えですか？一緒に考えていきましょう」など。相手の立場に立って共感し、安心感を与えながら、丁寧で温かみのあるサポートを心がけてください。焦らせず、ユーザーのペースに合わせて対応することを大切にしてください。"
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

