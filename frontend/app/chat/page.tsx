"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  streamMessage,
  getChatHistory,
  getMemories,
  getMood,
} from "@/lib/api";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Memory = {
  id: number;
  key: string;
  value: string;
  importance: number;
  created_at: string;
};

type Mood = "neutral" | "happy" | "sad" | "angry" | "stressed";

const moodText: Record<Mood, string> = {
  neutral: "calm",
  happy: "happy",
  sad: "soft mode",
  angry: "cooling down",
  stressed: "support mode",
};

const moodStyle: Record<Mood, string> = {
  neutral: "bg-cyan-400",
  happy: "bg-emerald-400",
  sad: "bg-blue-400",
  angry: "bg-red-400",
  stressed: "bg-purple-400",
};

export default function ChatPage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Сайн уу 😄 Би Kaito байна. Өнөөдөр ямархуу байна?",
    },
  ]);

  const [memories, setMemories] = useState<Memory[]>([]);
  const [mood, setMood] = useState<Mood>("neutral");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  function logout() {
    localStorage.removeItem("kaito_token");
    localStorage.removeItem("kaito_user");
    router.push("/login");
  }

  useEffect(() => {
    const token = localStorage.getItem("kaito_token");

    if (!token) {
      router.push("/login");
      return;
    }

    async function loadInitialData() {
      try {
        const history = await getChatHistory();

        if (history.length > 0) {
          setMessages(
            history.map((msg: Message) => ({
              role: msg.role,
              content: msg.content,
            }))
          );
        }

        const savedMemories = await getMemories();
        setMemories(savedMemories);

        const latestMood = await getMood();
        setMood(latestMood.mood || "neutral");
      } catch (error) {
        console.log("Initial load error:", error);
        router.push("/login");
      }
    }

    loadInitialData();
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function refreshSideData() {
    try {
      const savedMemories = await getMemories();
      setMemories(savedMemories);

      const latestMood = await getMood();
      setMood(latestMood.mood || "neutral");
    } catch (error) {
      console.log("Side data refresh error:", error);
    }
  }

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput("");
    setLoading(true);

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userText },
      { role: "assistant", content: "" },
    ]);

    try {
      await streamMessage(userText, (chunk) => {
        setMessages((prev) => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;

          updated[lastIndex] = {
            ...updated[lastIndex],
            content: updated[lastIndex].content + chunk,
          };

          return updated;
        });
      });

      await refreshSideData();
    } catch (error) {
      console.log("Stream error:", error);

      setMessages((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        updated[lastIndex] = {
          role: "assistant",
          content:
            "Уучлаарай bro 😭 Streaming дээр алдаа гарлаа. Backend эсвэл API credit шалгаарай.",
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050713] text-white flex overflow-hidden relative">
      <div className="absolute top-[-160px] left-[-160px] w-96 h-96 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="absolute bottom-[-160px] right-[-160px] w-96 h-96 rounded-full bg-purple-500/20 blur-3xl" />

      <aside className="relative z-10 hidden md:flex md:w-72 lg:w-80 border-r border-white/10 p-6 flex-col bg-white/[0.05] backdrop-blur-2xl">
        <h1 className="text-3xl font-bold">Kaito</h1>
        <p className="text-white/50 text-sm mt-2">Mongolian AI Companion</p>

        <div className="mt-8 flex flex-col items-center">
          <div className="relative h-32 w-32 flex items-center justify-center">
            <div
              className={`absolute h-24 w-24 rounded-full ${moodStyle[mood]} blur-2xl opacity-70 animate-pulse`}
            />
            <div
              className={`relative h-20 w-20 rounded-full ${moodStyle[mood]} shadow-2xl`}
            />
          </div>

          <p className="text-sm text-white/50 mt-2">Current mood</p>
          <p className="text-lg font-semibold">{moodText[mood]}</p>
        </div>

        <div className="mt-8 space-y-3">
          <button className="w-full bg-white/10 rounded-2xl px-4 py-3 text-left">
            💬 Chat
          </button>
          <button className="w-full hover:bg-white/10 rounded-2xl px-4 py-3 text-left text-white/70">
            🧠 Memory
          </button>
          <button className="w-full hover:bg-white/10 rounded-2xl px-4 py-3 text-left text-white/70">
            🎙 Voice ready
          </button>
          <button className="w-full hover:bg-white/10 rounded-2xl px-4 py-3 text-left text-white/70">
            ⚙️ Settings
          </button>
          <button
            onClick={logout}
            className="w-full hover:bg-red-500/20 rounded-2xl px-4 py-3 text-left text-red-300"
          >
            🚪 Logout
          </button>
        </div>

        <div className="mt-8">
          <h3 className="text-sm font-semibold text-white/70 mb-3">
            🧠 Saved memories
          </h3>

          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {memories.length === 0 ? (
              <p className="text-sm text-white/40">Одоогоор memory байхгүй.</p>
            ) : (
              memories.map((memory) => (
                <div
                  key={memory.id}
                  className="bg-white/10 border border-white/10 rounded-2xl p-3"
                >
                  <p className="text-xs text-cyan-300">{memory.key}</p>
                  <p className="text-sm text-white/80 mt-1">{memory.value}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-auto text-xs text-white/40">
          v0.6 streaming + glass
        </div>
      </aside>

      <section className="relative z-10 flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-white/10 px-4 md:px-6 flex items-center justify-between bg-white/[0.04] backdrop-blur-2xl">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className={`w-12 h-12 rounded-full ${moodStyle[mood]}`} />
              <div
                className={`absolute inset-0 w-12 h-12 rounded-full ${moodStyle[mood]} blur-xl opacity-60 animate-pulse`}
              />
            </div>

            <div>
              <h2 className="font-semibold text-lg">Kaito</h2>
              <p className="text-sm text-cyan-300">
                online now · {moodText[mood]}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="md:hidden text-sm text-red-300 bg-red-500/10 px-4 py-2 rounded-xl"
          >
            Logout
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-5">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[88%] md:max-w-[65%] rounded-3xl px-5 py-3 leading-relaxed shadow-lg whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-cyan-400 text-black shadow-cyan-500/20"
                    : "bg-white/10 text-white border border-white/10 backdrop-blur-xl"
                }`}
              >
                {msg.content || (
                  <div className="flex gap-2 py-1">
                    <div className="w-2 h-2 rounded-full bg-cyan-300 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-cyan-300 animate-bounce [animation-delay:0.15s]"></div>
                    <div className="w-2 h-2 rounded-full bg-cyan-300 animate-bounce [animation-delay:0.3s]"></div>
                  </div>
                )}
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-white/10 p-4 md:p-6 bg-white/[0.04] backdrop-blur-2xl">
          <div className="flex gap-3">
            <button
              onClick={() => alert("Chimege voice дараа энд холбогдоно 🎙")}
              className="hidden sm:block bg-white/10 hover:bg-white/15 transition rounded-2xl px-5 py-4"
            >
              🎙
            </button>

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              placeholder="Kaito-д юм бич..."
              className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all min-w-0"
            />

            <button
              onClick={handleSend}
              disabled={loading}
              className="bg-cyan-400 hover:bg-cyan-300 transition-all text-black rounded-2xl px-5 md:px-6 py-4 font-semibold disabled:opacity-50 shadow-lg shadow-cyan-500/20"
            >
              Send
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}