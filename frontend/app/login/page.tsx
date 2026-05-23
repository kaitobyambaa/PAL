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
    } catch (error) {
      alert("Login failed 😭 Email эсвэл password буруу байна.");
    }
  }

  return (
    <main className="min-h-screen bg-[#070A13] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/10 border border-white/10 rounded-3xl p-8">
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="text-white/50 mt-2">
          Kaito чамайг хүлээж байна 😄
        </p>

        <div className="mt-8 space-y-4">
          <input
            placeholder="Email"
            className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            placeholder="Password"
            type="password"
            className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleLogin}
            className="w-full bg-cyan-400 text-black rounded-2xl px-5 py-4 font-semibold"
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