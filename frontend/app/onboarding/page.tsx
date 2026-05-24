"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OnboardingPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [style, setStyle] = useState("calm");

  function finish() {
    localStorage.setItem(
      "suuder_onboarding",
      JSON.stringify({ name, style })
    );

    router.push("/chat");
  }

  return (
    <main className="min-h-screen bg-[#05060F] text-white flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-120px] left-[-120px] w-96 h-96 bg-cyan-500/20 blur-3xl rounded-full" />
      <div className="absolute bottom-[-120px] right-[-120px] w-96 h-96 bg-violet-500/20 blur-3xl rounded-full" />

      <div className="relative z-10 w-full max-w-xl bg-white/10 border border-white/10 backdrop-blur-2xl rounded-[2rem] p-8 shadow-2xl">
        <h1 className="text-4xl font-bold">Suuder-ээ тохируулъя</h1>
        <p className="text-white/50 mt-2">
          Чамтай яаж харилцахыг нь сонго.
        </p>

        <div className="mt-8 space-y-5">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Чамайг юу гэж дуудах вэ?"
            className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-cyan-400"
          />

          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-cyan-400"
          >
            <option value="calm">Calm / тайван</option>
            <option value="funny">Funny / хөгжилтэй</option>
            <option value="motivational">Motivational / урам өгдөг</option>
            <option value="listener">Listener / сонсдог найз</option>
          </select>

          <button
            onClick={finish}
            className="w-full bg-cyan-400 text-black rounded-2xl px-5 py-4 font-semibold hover:bg-cyan-300 transition"
          >
            Эхлэх
          </button>
        </div>
      </div>
    </main>
  );
}