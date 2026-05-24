"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  streamMessage,
  getChatHistory,
  getMemories,
  getMood,
  updateMemory,
  deleteMemory,
  getSettings,
  updateSettings,
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

type UserSettings = {
  ai_style: string;
  language_style: string;
  theme: string;
};

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
      content: "Сайн уу 😄 Би Suuder байна. Өнөөдөр ямархуу байна?",
    },
  ]);

  const [memories, setMemories] = useState<Memory[]>([]);
  const [mood, setMood] = useState<Mood>("neutral");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [activePanel, setActivePanel] = useState<"chat" | "memory" | "settings">(
    "chat"
  );

  const [settings, setSettings] = useState<UserSettings>({
    ai_style: "calm",
    language_style: "natural",
    theme: "dark",
  });

  const [editingMemoryId, setEditingMemoryId] = useState<number | null>(null);
  const [editKey, setEditKey] = useState("");
  const [editValue, setEditValue] = useState("");
  const [editImportance, setEditImportance] = useState(2);

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
              content: msg.content.replaceAll("Kaito", "Suuder"),
            }))
          );
        }

        const savedMemories = await getMemories();
        setMemories(savedMemories);

        const latestMood = await getMood();
        setMood(latestMood.mood || "neutral");

        const savedSettings = await getSettings();
        setSettings(savedSettings);
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

      const savedSettings = await getSettings();
      setSettings(savedSettings);
    } catch (error) {
      console.log("Side refresh failed:", error);
    }
  }

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userText = input.trim();

    setInput("");
    setLoading(true);
    setActivePanel("chat");

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
            content:
              updated[lastIndex].content + chunk.replaceAll("Kaito", "Suuder"),
          };

          return updated;
        });
      });

      await refreshSideData();
    } catch (error) {
      console.log("Stream error:", error);

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content:
            "Уучлаарай bro 😭 Одоогоор AI API эсвэл backend дээр асуудал гарлаа.",
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  function startVoiceInput() {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Энэ browser voice input дэмжихгүй байна 😭 Chrome ашиглаарай.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "mn-MN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setInput(text);
    };

    recognition.onerror = () => {
      alert("Voice input дээр алдаа гарлаа 😭");
    };

    recognition.start();
  }

  function startEditMemory(memory: Memory) {
    setEditingMemoryId(memory.id);
    setEditKey(memory.key);
    setEditValue(memory.value);
    setEditImportance(memory.importance);
  }

  async function saveEditedMemory() {
    if (!editingMemoryId) return;

    try {
      await updateMemory(editingMemoryId, editKey, editValue, editImportance);
      setEditingMemoryId(null);
      await refreshSideData();
    } catch (error) {
      alert("Memory update failed 😭");
    }
  }

  async function removeMemory(id: number) {
    const ok = confirm("Энэ memory-г устгах уу?");
    if (!ok) return;

    try {
      await deleteMemory(id);
      await refreshSideData();
    } catch (error) {
      alert("Memory delete failed 😭");
    }
  }

  async function saveSettings() {
    try {
      const updated = await updateSettings(
        settings.ai_style,
        settings.language_style,
        settings.theme
      );

      setSettings(updated);
      alert("Settings хадгалагдлаа 😄");
    } catch (error) {
      alert("Settings save failed 😭");
    }
  }

  return (
    <main className="min-h-screen bg-[#05060F] text-white flex overflow-hidden relative">
      <div className="absolute top-[-160px] left-[-160px] w-96 h-96 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="absolute bottom-[-160px] right-[-160px] w-96 h-96 rounded-full bg-violet-500/20 blur-3xl" />

      <aside className="relative z-10 hidden md:flex md:w-72 lg:w-80 border-r border-white/10 p-6 flex-col bg-white/[0.05] backdrop-blur-2xl">
        <h1 className="text-3xl font-bold">Suuder AI</h1>
        <p className="text-white/50 text-sm mt-2">Always beside you</p>

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
          <button
            onClick={() => setActivePanel("chat")}
            className={`w-full rounded-2xl px-4 py-3 text-left transition ${
              activePanel === "chat" ? "bg-white/10" : "hover:bg-white/10 text-white/70"
            }`}
          >
            💬 Chat
          </button>

          <button
            onClick={() => setActivePanel("memory")}
            className={`w-full rounded-2xl px-4 py-3 text-left transition ${
              activePanel === "memory"
                ? "bg-white/10"
                : "hover:bg-white/10 text-white/70"
            }`}
          >
            🧠 Memory
          </button>

          <button
            onClick={startVoiceInput}
            className="w-full hover:bg-white/10 rounded-2xl px-4 py-3 text-left text-white/70 transition"
          >
            🎙 Voice input
          </button>

          <button
            onClick={() => setActivePanel("settings")}
            className={`w-full rounded-2xl px-4 py-3 text-left transition ${
              activePanel === "settings"
                ? "bg-white/10"
                : "hover:bg-white/10 text-white/70"
            }`}
          >
            ⚙️ Settings
          </button>

          <button
            onClick={logout}
            className="w-full hover:bg-red-500/20 rounded-2xl px-4 py-3 text-left text-red-300 transition"
          >
            🚪 Logout
          </button>
        </div>

        <div className="mt-auto text-xs text-white/40">
          Suuder AI · MVP v0.8
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
              <h2 className="font-semibold text-lg">Suuder</h2>
              <p className="text-sm text-cyan-300">
                online now · {moodText[mood]}
              </p>
            </div>
          </div>

          <div className="flex gap-2 md:hidden">
            <button
              onClick={() => setActivePanel("chat")}
              className="text-xs bg-white/10 px-3 py-2 rounded-xl"
            >
              Chat
            </button>
            <button
              onClick={() => setActivePanel("memory")}
              className="text-xs bg-white/10 px-3 py-2 rounded-xl"
            >
              Memory
            </button>
            <button
              onClick={() => setActivePanel("settings")}
              className="text-xs bg-white/10 px-3 py-2 rounded-xl"
            >
              Settings
            </button>
          </div>
        </header>

        {activePanel === "chat" && (
          <>
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
                  onClick={startVoiceInput}
                  className="bg-white/10 hover:bg-white/15 transition rounded-2xl px-5 py-4"
                >
                  🎙
                </button>

                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSend();
                  }}
                  placeholder="Suuder-д юм бич..."
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
          </>
        )}

        {activePanel === "memory" && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold">Memory</h2>
              <p className="text-white/50 mt-2">
                Suuder чиний тухай санаж байгаа зүйлс.
              </p>

              <div className="mt-8 space-y-4">
                {memories.length === 0 ? (
                  <div className="bg-white/10 border border-white/10 rounded-3xl p-6 text-white/50">
                    Одоогоор memory байхгүй.
                  </div>
                ) : (
                  memories.map((memory) => (
                    <div
                      key={memory.id}
                      className="bg-white/10 border border-white/10 rounded-3xl p-5"
                    >
                      {editingMemoryId === memory.id ? (
                        <div className="space-y-3">
                          <input
                            value={editKey}
                            onChange={(e) => setEditKey(e.target.value)}
                            className="w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3 outline-none"
                          />

                          <textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3 outline-none min-h-28"
                          />

                          <input
                            type="number"
                            min={1}
                            max={5}
                            value={editImportance}
                            onChange={(e) =>
                              setEditImportance(Number(e.target.value))
                            }
                            className="w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3 outline-none"
                          />

                          <div className="flex gap-3">
                            <button
                              onClick={saveEditedMemory}
                              className="bg-cyan-400 text-black rounded-2xl px-4 py-3 font-semibold"
                            >
                              Save
                            </button>

                            <button
                              onClick={() => setEditingMemoryId(null)}
                              className="bg-white/10 rounded-2xl px-4 py-3"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-xs text-cyan-300">
                            {memory.key} · importance {memory.importance}
                          </p>

                          <p className="text-white/80 mt-2">{memory.value}</p>

                          <div className="flex gap-3 mt-4">
                            <button
                              onClick={() => startEditMemory(memory)}
                              className="bg-white/10 hover:bg-white/15 rounded-2xl px-4 py-2 text-sm"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => removeMemory(memory.id)}
                              className="bg-red-500/10 hover:bg-red-500/20 text-red-300 rounded-2xl px-4 py-2 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activePanel === "settings" && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold">Settings</h2>
              <p className="text-white/50 mt-2">
                Suuder-ийн харилцах style-ийг тохируул.
              </p>

              <div className="mt-8 bg-white/10 border border-white/10 rounded-3xl p-6 space-y-5">
                <div>
                  <label className="text-sm text-white/60">AI style</label>
                  <select
                    value={settings.ai_style}
                    onChange={(e) =>
                      setSettings({ ...settings, ai_style: e.target.value })
                    }
                    className="mt-2 w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 outline-none"
                  >
                    <option value="calm">Calm</option>
                    <option value="funny">Funny</option>
                    <option value="motivational">Motivational</option>
                    <option value="romantic">Romantic</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-white/60">
                    Language style
                  </label>
                  <select
                    value={settings.language_style}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        language_style: e.target.value,
                      })
                    }
                    className="mt-2 w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 outline-none"
                  >
                    <option value="natural">Natural Mongolian</option>
                    <option value="slang">Slang / bro style</option>
                    <option value="formal">Formal</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-white/60">Theme</label>
                  <select
                    value={settings.theme}
                    onChange={(e) =>
                      setSettings({ ...settings, theme: e.target.value })
                    }
                    className="mt-2 w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 outline-none"
                  >
                    <option value="dark">Dark</option>
                    <option value="soft">Soft</option>
                    <option value="neon">Neon</option>
                  </select>
                </div>

                <button
                  onClick={saveSettings}
                  className="bg-cyan-400 text-black rounded-2xl px-5 py-4 font-semibold"
                >
                  Save settings
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}