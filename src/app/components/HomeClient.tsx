'use client'

import axios from "axios";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Badge from "@/app/components/Badge";

function HomeClient({ ownerId }: { ownerId?: string }) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [showIntroGlow, setShowIntroGlow] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleLogin = () => {
    setLoading(true);
    window.location.href = "/api/auth/login";
  };

  const handleLogout = async () => {
    try {
      await axios.get("/api/auth/logout");
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const handleCTA = () => {
    if (ownerId) window.location.href = "/dashboard";
    else handleLogin();
  };

  const firstLetter = ownerId ? ownerId[0].toUpperCase() : "";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("loggedIn") === "1") {
      window.history.replaceState({}, "", "/");
      window.location.reload();
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowIntroGlow(false), 2200);
    return () => window.clearTimeout(timer);
  }, []);

  const fadeUp = {
    initial: { opacity: 0, y: 32 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.55 },
    viewport: { once: true, amount: 0.25 },
  };

  const featureCards = [
    {
      title: "AI That Replies First",
      body: "Answer common support questions instantly using your business context and saved knowledge.",
      accent: "from-amber-200/50 via-orange-100/30 to-transparent",
    },
    {
      title: "Human Handoff That Feels Smooth",
      body: "Escalate frustrated or high-value conversations to a real agent without breaking the flow.",
      accent: "from-sky-200/50 via-cyan-100/30 to-transparent",
    },
    {
      title: "Widget Ready for Any Site",
      body: "Drop one script into your website and launch a real support assistant in minutes.",
      accent: "from-emerald-200/50 via-lime-100/30 to-transparent",
    },
  ];

  const stats = [
    { value: "24/7", label: "AI support coverage" },
    { value: "<2s", label: "Fast first response" },
    { value: "Live", label: "Human takeover when needed" },
  ];

  return (
    <>
      <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#fff7ed_0%,#f8fafc_34%,#dbeafe_68%,#f8fafc_100%)] text-slate-950">
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <AnimatePresence>
            {showIntroGlow && (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 0.75, scale: 1.05 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="absolute left-[8%] top-20 h-40 w-40 rounded-full bg-orange-300/35 blur-3xl"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 0.65, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.15 }}
                  transition={{ duration: 1.35, delay: 0.15, ease: "easeOut" }}
                  className="absolute right-[10%] top-28 h-52 w-52 rounded-full bg-sky-300/30 blur-3xl"
                />
              </>
            )}
          </AnimatePresence>

          <motion.div
            animate={{ x: [0, 30, -10, 0], y: [0, -20, 10, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-[-8rem] top-[-6rem] h-80 w-80 rounded-full bg-orange-300/30 blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -50, 10, 0], y: [0, 20, -30, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-[-6rem] top-16 h-[26rem] w-[26rem] rounded-full bg-sky-300/30 blur-3xl"
          />
          <motion.div
            animate={{ x: [0, 25, 0], y: [0, -25, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[-8rem] left-1/3 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl"
          />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.55)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.55)_1px,transparent_1px)] bg-[size:72px_72px] opacity-40" />
        </div>

        <motion.header
          initial={{ y: -18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed top-0 left-0 z-50 w-full border-b border-white/40 bg-white/45 backdrop-blur-2xl"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="group flex cursor-pointer items-center gap-3">
              <div className="rounded-2xl border border-white/60 bg-white/80 p-2 shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition duration-500 group-hover:-translate-y-0.5 group-hover:rotate-3">
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="h-10 w-10 object-contain"
                />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-slate-500">
                  Customer Support OS
                </p>
                <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                  Support<span className="text-orange-500">Sync</span>
                </h1>
              </div>
            </div>

            {ownerId ? (
              <div className="relative" ref={dropdownRef}>
                <div
                  onClick={() => setOpen(!open)}
                  className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-slate-900 text-white shadow-lg transition hover:scale-105"
                >
                  {firstLetter}
                </div>

                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 mt-3 w-56 rounded-3xl border border-white/70 bg-white/90 p-2 shadow-2xl backdrop-blur-xl"
                    >
                      <div className="border-b border-slate-100 px-3 py-2 text-xs text-slate-500">
                        {ownerId}
                      </div>
                      <button
                        onClick={() => router.push("/dashboard")}
                        className="mt-1 w-full rounded-2xl px-3 py-2 text-left transition hover:bg-slate-100"
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full rounded-2xl px-3 py-2 text-left text-red-600 transition hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                disabled={loading}
                className="rounded-full bg-slate-950 px-5 py-2.5 text-white shadow-lg transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Redirecting..." : "Login"}
              </button>
            )}
          </div>
        </motion.header>

        <main className="mx-auto max-w-7xl px-6 pb-20 pt-32">
          <section className="grid items-center gap-14 lg:grid-cols-[1.08fr_0.92fr]">
            <div>
              <motion.div
                {...fadeUp}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/75 px-4 py-2 text-sm text-slate-700 shadow-[0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                AI-first support with instant human handoff
              </motion.div>

              <motion.h2
                {...fadeUp}
                className="max-w-3xl text-4xl font-semibold leading-[0.98] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl"
              >
                Make your support feel
                <span className="block bg-gradient-to-r from-orange-500 via-amber-500 to-sky-500 bg-clip-text text-transparent">
                  premium, fast, and always on.
                </span>
              </motion.h2>

              <motion.p
                {...fadeUp}
                className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg"
              >
                SupportSync handles routine conversations with AI, detects when a
                customer needs a real person, and smoothly hands the chat to your
                team in real time.
              </motion.p>

              <motion.div
                {...fadeUp}
                className="mt-9 flex flex-col gap-4 sm:flex-row"
              >
                <button
                  onClick={handleCTA}
                  className="rounded-2xl bg-slate-950 px-7 py-4 text-base font-medium text-white shadow-[0_18px_40px_rgba(15,23,42,0.22)] transition hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  {ownerId ? "Open Dashboard" : "Get Started"}
                </button>
                <button
                  onClick={() =>
                    document
                      .getElementById("features")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="rounded-2xl border border-slate-200 bg-white/75 px-7 py-4 text-base font-medium text-slate-700 shadow-[0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-slate-300"
                >
                  Explore Features
                </button>
              </motion.div>

              <motion.div
                {...fadeUp}
                className="mt-10 grid gap-4 sm:grid-cols-3"
              >
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-3xl border border-white/70 bg-white/70 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl"
                  >
                    <p className="text-3xl font-semibold tracking-tight text-slate-950">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 40, y: 18 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.75, ease: "easeOut" }}
              className="relative mx-auto w-full max-w-[29rem]"
            >
              <div className="absolute -left-8 top-8 h-28 w-28 rounded-[2rem] bg-orange-300/30 blur-2xl" />
              <div className="absolute -right-6 bottom-8 h-36 w-36 rounded-full bg-sky-300/25 blur-2xl" />

              <div className="relative rounded-[2rem] border border-white/70 bg-white/75 p-4 shadow-[0_30px_90px_rgba(15,23,42,0.18)] backdrop-blur-2xl">
                <div className="rounded-[1.6rem] border border-slate-100 bg-slate-950 p-5 text-white shadow-inner">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                        Live Preview
                      </p>
                      <h3 className="mt-1 text-lg font-medium">Support Console</h3>
                    </div>
                    <div className="flex gap-2">
                      <span className="h-3 w-3 rounded-full bg-rose-400" />
                      <span className="h-3 w-3 rounded-full bg-amber-400" />
                      <span className="h-3 w-3 rounded-full bg-emerald-400" />
                    </div>
                  </div>

                  <div className="space-y-4 rounded-[1.4rem] bg-white/6 p-4">
                    <div className="flex justify-start">
                      <div className="max-w-[78%] rounded-2xl rounded-tl-md bg-white/10 px-4 py-3 text-sm text-slate-100">
                        Hi there, welcome to SupportSync. How can I help today?
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <div className="max-w-[78%] rounded-2xl rounded-tr-md bg-gradient-to-r from-orange-400 to-amber-400 px-4 py-3 text-sm font-medium text-slate-950">
                        My order is delayed and I need urgent help.
                      </div>
                    </div>

                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-emerald-300">
                        Escalation Triggered
                      </div>
                      <p className="mt-2 text-sm text-slate-200">
                        Customer frustration detected. Routing this conversation
                        to a live agent while AI keeps context ready.
                      </p>
                    </div>

                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                      className="grid gap-3 rounded-2xl bg-white p-4 text-slate-900 shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                            Human Agent
                          </p>
                          <h4 className="text-sm font-semibold">Live Support</h4>
                        </div>
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                          Live
                        </span>
                      </div>
                      <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
                        Agent is handling your chat. Please wait...
                      </div>
                    </motion.div>
                  </div>
                </div>

                <motion.div
                  animate={{ y: [0, -7, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-5 -right-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500 to-amber-400 text-2xl shadow-[0_20px_40px_rgba(251,146,60,0.35)]"
                >
                  💬
                </motion.div>
              </div>
            </motion.div>
          </section>

          <section id="features" className="mt-28">
            <motion.div {...fadeUp} className="mb-14 text-center">
              <div className="mb-5 inline-flex rounded-full border border-white/70 bg-white/75 px-4 py-2 text-sm text-slate-700 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                Crafted for modern support teams
              </div>
              <h3 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                A better first impression for every customer conversation.
              </h3>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                SupportSync blends automation, escalation, and real-time support
                in one clean system that feels fast on the outside and manageable
                on the inside.
              </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-3">
              {featureCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  {...fadeUp}
                  transition={{ delay: index * 0.06, duration: 0.55 }}
                  whileHover={{ y: -8 }}
                  className="group relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/75 p-7 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${card.accent} opacity-0 transition duration-500 group-hover:opacity-100`}
                  />
                  <div className="relative">
                    <div className="mb-5 h-12 w-12 rounded-2xl bg-slate-950 text-lg text-white shadow-lg" />
                    <h4 className="text-xl font-semibold tracking-tight text-slate-950">
                      {card.title}
                    </h4>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {card.body}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="mt-28 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <motion.div
              {...fadeUp}
              className="rounded-[2rem] border border-white/80 bg-slate-950 p-8 text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)]"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-orange-300">
                Why it feels better
              </p>
              <h3 className="mt-3 text-3xl font-semibold tracking-tight">
                Faster replies, calmer handoffs, cleaner operations.
              </h3>
              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300">
                Your AI handles the repetitive work, your agents jump in only when
                needed, and customers never feel like they fell into a broken support loop.
              </p>
            </motion.div>

            <div className="grid gap-5 sm:grid-cols-3">
              {[
                { value: "90%", label: "routine questions answered by AI" },
                { value: "1 script", label: "to embed the widget anywhere" },
                { value: "Instant", label: "real-time sync with live agents" },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  {...fadeUp}
                  transition={{ delay: index * 0.05, duration: 0.55 }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  className="rounded-[2rem] border border-white/80 bg-white/75 p-7 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl"
                >
                  <p className="text-3xl font-semibold tracking-tight text-orange-500">
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {item.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="mt-28">
            <motion.div
              {...fadeUp}
              className="relative overflow-hidden rounded-[2.4rem] border border-white/80 bg-white/75 px-8 py-14 text-center shadow-[0_24px_80px_rgba(15,23,42,0.1)] backdrop-blur-2xl md:px-16"
            >
              <div className="absolute left-10 top-10 h-24 w-24 rounded-full bg-orange-300/25 blur-2xl" />
              <div className="absolute bottom-6 right-10 h-32 w-32 rounded-full bg-sky-300/20 blur-3xl" />

              <div className="relative">
                <p className="text-xs uppercase tracking-[0.34em] text-slate-500">
                  Launch your support system
                </p>
                <h3 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
                  Launch a landing page that feels sharp, modern, and support-ready.
                </h3>
                <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                  Create a stronger first impression, onboard faster, and make
                  your support workflow feel polished from the very first visit.
                </p>
                <button
                  onClick={handleCTA}
                  className="mt-9 rounded-2xl bg-slate-950 px-8 py-4 text-lg font-medium text-white shadow-[0_18px_40px_rgba(15,23,42,0.2)] transition hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  {ownerId ? "Go to Dashboard" : "Start Building"}
                </button>
              </div>
            </motion.div>
          </section>
        </main>

        <footer className="px-6 pb-12 pt-6 text-center text-sm text-slate-500">
          <p>
            © {new Date().getFullYear()} SupportSync. Built for modern AI + human
            support experiences.
          </p>
          <div className="mt-2 flex justify-center gap-4 text-xs">
            <a
              href="https://www.linkedin.com/in/prakharkumar1980"
              target="_blank"
              className="transition hover:text-sky-600"
            >
              LinkedIn
            </a>
          </div>
        </footer>
      </div>

      <Badge />

      {loading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/30 backdrop-blur-sm">
          <div className="rounded-2xl border border-white/60 bg-white px-6 py-4 text-sm shadow-2xl">
            Logging you in...
          </div>
        </div>
      )}
    </>
  );
}

export default HomeClient;
