"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useRouter } from "next/navigation";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface ChatInterfaceProps {
    conversationId: string;
    initialMessages?: Array<{
        id: string;
        role: "user" | "assistant";
        content: string;
    }>;
}

export function ChatInterface({ conversationId, initialMessages = [] }: ChatInterfaceProps) {
    const router = useRouter();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [messages, setMessages] = useState<Message[]>(
        initialMessages.length > 0
            ? initialMessages
            : [
                {
                    role: "assistant",
                    content: "こんにちは！黒崎AIです。何かお手伝いできることはありますか？",
                },
            ]
    );
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // URLパラメータから初期メッセージを取得して送信
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const initialMessage = params.get("initialMessage");
        if (initialMessage && messages.length === 1) {
            setInput(initialMessage);
            // 自動送信
            setTimeout(() => {
                const userMessage: Message = {
                    role: "user",
                    content: initialMessage,
                };
                const newMessages = [...messages, userMessage];
                setMessages(newMessages);
                setIsLoading(true);

                // メッセージ保存とAI応答取得
                (async () => {
                    try {
                        await fetch("/api/messages", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                conversationId,
                                role: "user",
                                content: initialMessage,
                            }),
                        });

                        const response = await fetch("/api/chat", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ messages: newMessages }),
                        });

                        const data = await response.json();
                        if (response.ok) {
                            const aiMessage: Message = {
                                role: "assistant",
                                content: data.message,
                            };
                            setMessages((prev) => [...prev, aiMessage]);

                            await fetch("/api/messages", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    conversationId,
                                    role: "assistant",
                                    content: data.message,
                                }),
                            });

                            router.refresh();
                        }
                    } catch (error) {
                        console.error("Error:", error);
                    } finally {
                        setIsLoading(false);
                        setInput("");
                        // URLパラメータをクリア
                        window.history.replaceState({}, "", `/chat/${conversationId}`);
                    }
                })();
            }, 100);
        }
    }, [conversationId, messages.length, router]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            role: "user",
            content: input,
        };

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput("");
        setIsLoading(true);

        try {
            // ユーザーメッセージを保存
            await fetch("/api/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    conversationId,
                    role: "user",
                    content: userMessage.content,
                }),
            });

            // AI応答を取得
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ messages: newMessages }),
            });

            const data = await response.json();

            if (response.ok) {
                const aiMessage: Message = {
                    role: "assistant",
                    content: data.message,
                };
                setMessages((prev) => [...prev, aiMessage]);

                // AI応答を保存
                await fetch("/api/messages", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        conversationId,
                        role: "assistant",
                        content: data.message,
                    }),
                });

                // 会話リストを更新
                router.refresh();
            } else {
                const errorMessage: Message = {
                    role: "assistant",
                    content: "エラーが発生しました。もう一度お試しください。",
                };
                setMessages((prev) => [...prev, errorMessage]);
            }
        } catch (error) {
            console.error("Error:", error);
            const errorMessage: Message = {
                role: "assistant",
                content: "通信エラーが発生しました。",
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-screen bg-muted/20 pt-16 md:pt-0">
            {/* Messages Area - LINE風 */}
            <div className="flex-1 overflow-y-auto px-3 md:px-4 py-4 md:py-6">
                <div className="max-w-4xl mx-auto space-y-4">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[70%] rounded-2xl px-4 py-3 ${message.role === "user"
                                    ? "bg-primary text-primary-foreground rounded-br-sm"
                                    : "bg-background border rounded-bl-sm shadow-sm"
                                    }`}
                            >
                                <p className="text-sm whitespace-pre-wrap break-words">
                                    {message.content}
                                </p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="max-w-[70%] rounded-2xl px-4 py-3 bg-background border rounded-bl-sm shadow-sm">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area - LINE風 */}
            <div className="border-t bg-background/95 backdrop-blur safe-bottom">
                <div className="max-w-4xl mx-auto px-3 md:px-4 py-2 md:py-3">
                    <div className="flex items-end gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="メッセージを入力..."
                            disabled={isLoading}
                            className="flex-1 rounded-full border-2 resize-none text-sm md:text-base h-10 md:h-12"
                        />
                        <Button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            size="icon"
                            className="rounded-full h-10 w-10 flex-shrink-0"
                        >
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

