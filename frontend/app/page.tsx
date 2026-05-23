"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#05060F] text-white overflow-hidden relative">
      <div className="absolute top-[-180px] left-[-140px] w-[420px] h-[420px] bg-cyan-500/20 blur-3xl rounded-full" />
      <div className="absolute bottom-[-180px] right-[-140px] w-[420px] h-[420px] bg-violet-500/20 blur-3xl rounded-full" />

      <nav className="relative z-10 flex items-center justify-between px-6 md:px-16 py-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Suuder AI</h1>
          <p className="text-xs text-white/40">Always beside you</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/login")}
            className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 transition"
          >
            Login
          </button>

          <button
            onClick={() => router.push("/register")}
            className="px-5 py-3 rounded-2xl bg-cyan-400 text-black font-semibold hover:bg-cyan-300 transition"
          >
            Start
          </button>
        </div>
      </nav>

      <section className="relative z-10 px-6 md:px-16 pt-16 md:pt-28 grid md:grid-cols-2 gap-14 items-center">
        <div>
          <p className="inline-flex px-4 py-2 rounded-full bg-white/10 border border-white/10 text-cyan-300 text-sm">
            Монгол AI companion
          </p>

          <h2 className="text-5xl md:text-7xl font-bold mt-6 leading-tight">
            Чамтай хамт <br />
            <span className="text-cyan-300">байдаг AI.</span>
          </h2>

          <p className="text-white/60 text-lg mt-6 max-w-xl leading-relaxed">
            Suuder AI бол Монгол хэлээр дулаахан ярилцдаг, сэтгэл хөдлөлийг
            мэдэрдэг, чамайг санаж байдаг AI найз.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-10">
            <button
              onClick={() => router.push("/register")}
              className="px-8 py-4 rounded-2xl bg-cyan-400 text-black font-semibold shadow-lg shadow-cyan-500/20 hover:bg-cyan-300 transition"
            >
              Ярилцаж эхлэх
            </button>

            <button
              onClick={() => router.push("/login")}
              className="px-8 py-4 rounded-2xl bg-white/10 border border-white/10 hover:bg-white/15 transition"
            >
              Нэвтрэх
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="absolute w-80 h-80 md:w-[420px] md:h-[420px] rounded-full bg-cyan-400/20 blur-3xl animate-pulse" />

          <div className="relative w-full max-w-md rounded-[2rem] bg-white/10 border border-white/10 backdrop-blur-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 bg-cyan-400 rounded-full" />
                <div className="absolute inset-0 w-14 h-14 bg-cyan-400 rounded-full blur-xl opacity-70 animate-pulse" />
              </div>

              <div>
                <h3 className="font-semibold text-lg">Suuder</h3>
                <p className="text-cyan-300 text-sm">online now · calm</p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="bg-white/10 rounded-3xl p-4 max-w-[85%] border border-white/10">
                Сайн уу 😄 Өнөөдөр ямархуу байна?
              </div>

              <div className="bg-cyan-400 text-black rounded-3xl p-4 ml-auto max-w-[85%]">
                Жаахан ядарч байна.
              </div>

              <div className="bg-white/10 rounded-3xl p-4 max-w-[90%] border border-white/10">
                Тэгвэл өнөөдөр өөртөө зөөлөн хандаарай. Би энд байна шүү 🤍
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}