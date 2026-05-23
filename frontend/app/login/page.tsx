"use client";

import { useState } from "react";
import { loginUser } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    try {
      const data = await loginUser(email, password);

      localStorage.setItem("kaito_token", data.access_token);
      localStorage.setItem("kaito_user", JSON.stringify(data.user));

      router.push("/chat");
    } catch {
      alert("Login failed 😭 Email эсвэл password буруу байна.");
    }
  }

  return (
    <main className="min-h-screen bg-[#05060F] text-white flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-120px] left-[-120px] w-96 h-96 bg-cyan-500/20 blur-3xl rounded-full" />
      <div className="absolute bottom-[-120px] right-[-120px] w-96 h-96 bg-violet-500/20 blur-3xl rounded-full" />

      <div className="relative z-10 w-full max-w-md bg-white/10 border border-white/10 rounded-[2rem] p-8 backdrop-blur-2xl shadow-2xl">
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="text-white/50 mt-2">Suuder чамайг хүлээж байна 😄</p>

        <div className="mt-8 space-y-4">
          <input
            placeholder="Email"
            className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-cyan-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            placeholder="Password"
            type="password"
            className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-cyan-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleLogin}
            className="w-full bg-cyan-400 text-black rounded-2xl px-5 py-4 font-semibold hover:bg-cyan-300 transition"
          >
            Login
          </button>

          <button
            onClick={() => router.push("/register")}
            className="w-full text-white/60 text-sm"
          >
            New here? Register
          </button>
        </div>
      </div>
    </main>
  );
}