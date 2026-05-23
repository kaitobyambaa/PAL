"use client";

import { useState } from "react";
import { registerUser } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleRegister() {
    try {
      const data = await registerUser(name, email, password);

      localStorage.setItem("kaito_token", data.access_token);
      localStorage.setItem("kaito_user", JSON.stringify(data.user));

      router.push("/chat");
    } catch (error) {
      alert("Register failed 😭 Email давхардсан эсвэл буруу байна.");
    }
  }

  return (
    <main className="min-h-screen bg-[#070A13] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/10 border border-white/10 rounded-3xl p-8">
        <h1 className="text-3xl font-bold">Create Kaito account</h1>
        <p className="text-white/50 mt-2">
          Монгол AI companion-оо эхлүүлье 😄
        </p>

        <div className="mt-8 space-y-4">
          <input
            placeholder="Name"
            className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

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
            onClick={handleRegister}
            className="w-full bg-cyan-400 text-black rounded-2xl px-5 py-4 font-semibold"
          >
            Register
          </button>

          <button
            onClick={() => router.push("/login")}
            className="w-full text-white/60 text-sm"
          >
            Already have account? Login
          </button>
        </div>
      </div>
    </main>
  );
}