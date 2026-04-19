'use client'
import axios from "axios";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation"; // ✅ added

function HomeClient({ email }: { email?: string }) {

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter(); // ✅ fixed

  const handleLogin = () => {
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

  const handleDashboard = () => {
    window.location.href = "/dashboard";
  };

  const handleCTA = () => {
    if (email) window.location.href = "/dashboard";
    else handleLogin();
  };

  const firstLetter = email ? email[0].toUpperCase() : "";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fadeUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
    viewport: { once: true }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-zinc-50 to-zinc-100 text-zinc-900">

      {/* NAVBAR */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <h1 className="text-xl font-bold">
            Support<span className="text-indigo-600">Sync</span> {/* ✅ updated */}
          </h1>

          {email ? (
            <div className="relative" ref={dropdownRef}>
              <div
                onClick={() => setOpen(!open)}
                className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center cursor-pointer"
              >
                {firstLetter}
              </div>

              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute right-0 mt-3 w-48 bg-white border rounded-xl shadow-xl p-2"
                  >
                    <div className="px-3 py-2 text-xs text-zinc-500 border-b">{email}</div>

                    <button 
                      onClick={() => router.push("/dashboard")} // ✅ fixed
                      className="w-full text-left px-3 py-2 hover:bg-zinc-100 rounded"
                    >
                      Dashboard
                    </button>

                    <button 
                      onClick={handleLogout} 
                      className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button onClick={handleLogin} className="px-5 py-2 bg-zinc-900 text-white rounded-full">
              Login
            </button>
          )}
        </div>
      </motion.header>

      {/* HERO */}
      <main className="max-w-7xl mx-auto px-6 pt-32 grid md:grid-cols-2 gap-12 items-center">

        {/* LEFT */}
        <div>
          <motion.h2 {...fadeUp} className="text-5xl font-bold leading-tight">
            AI + Human Support <br />
            <span className="text-indigo-600">Perfectly Synced</span>
          </motion.h2>

          <motion.p {...fadeUp} className="mt-6 text-zinc-600 max-w-md text-lg">
            A smart chatbot that handles users automatically and connects them to human support when needed.
          </motion.p>

          <motion.div {...fadeUp} className="mt-8 flex gap-4">
            <button onClick={handleCTA} className="px-6 py-3 bg-indigo-600 text-white rounded-xl">
              {email ? "Start Building" : "Get Started"}
            </button>

            <button
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              className="px-6 py-3 border rounded-xl"
            >
              Know More
            </button>
          </motion.div>
        </div>

        {/* RIGHT CHAT */}
        <div className="flex flex-col items-end">
          
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="w-full max-w-md bg-white border rounded-2xl shadow-xl p-6"
          >
            <div className="flex gap-2 mb-4">
              <span className="w-3 h-3 bg-red-400 rounded-full"></span>
              <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
              <span className="w-3 h-3 bg-green-400 rounded-full"></span>
            </div>

            <div className="space-y-3 text-sm">
              <p className="text-zinc-500">AI Agent</p>
              <div className="bg-zinc-100 p-3 rounded-xl w-fit">
                Hello! How can I help you today?
              </div>

              <p className="text-zinc-500 text-right">User</p>
              <div className="bg-indigo-50 p-3 rounded-xl w-fit ml-auto">
                I need help with refund 😡
              </div>

              <p className="text-zinc-500">System</p>
              <div className="bg-green-50 p-3 rounded-xl w-fit">
                Connecting to human agent...
              </div>
            </div>
          </motion.div>

          {/* CHAT ICON */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="mt-4"
          >
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition">
              💬
            </div>
          </motion.div>

        </div>
      </main>

      {/* FEATURES */}
      <section id="features" className="mt-32 max-w-7xl mx-auto px-6">
        <motion.h3 {...fadeUp} className="text-3xl font-bold text-center mb-10">
          Features
        </motion.h3>

        <div className="grid md:grid-cols-3 gap-6">
          <motion.div {...fadeUp} className="p-6 bg-white border rounded-xl">
            <h4 className="font-semibold mb-2">AI Auto Replies</h4>
            <p className="text-sm text-zinc-600">Handles queries instantly.</p>
          </motion.div>

          <motion.div {...fadeUp} className="p-6 bg-white border rounded-xl">
            <h4 className="font-semibold mb-2">Embed Anywhere</h4>
            <p className="text-sm text-zinc-600">Works on any website.</p>
          </motion.div>

          <motion.div {...fadeUp} className="p-6 bg-white border rounded-xl">
            <h4 className="font-semibold mb-2">Smart Escalation 🚀</h4>
            <p className="text-sm text-zinc-600">
              Detects frustration → switches to human instantly.
            </p>
          </motion.div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="mt-32 py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">

          <motion.h3 {...fadeUp} className="text-3xl font-bold mb-12">
            Why Businesses Choose SupportSync
          </motion.h3>

          <div className="grid md:grid-cols-3 gap-10">
            <motion.div {...fadeUp}>
              <h4 className="text-3xl font-bold text-indigo-600">90%</h4>
              <p className="text-sm text-zinc-600">Queries solved by AI</p>
            </motion.div>

            <motion.div {...fadeUp}>
              <h4 className="text-3xl font-bold text-indigo-600">24/7</h4>
              <p className="text-sm text-zinc-600">Always available support</p>
            </motion.div>

            <motion.div {...fadeUp}>
              <h4 className="text-3xl font-bold text-indigo-600">Instant</h4>
              <p className="text-sm text-zinc-600">Human escalation</p>
            </motion.div>
          </div>

        </div>
      </section>

      {/* CTA FIXED */}
      {/* 🔥 CTA PREMIUM SECTION */}
      <section className="py-24 bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-center">
        <motion.div {...fadeUp} className="max-w-2xl mx-auto bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl rounded-3xl p-10">
          <h3 className="text-3xl font-bold mb-4 text-zinc-900">
            Start building smarter support today
          </h3>

          <p className="text-zinc-600 mb-8">
            Automate conversations, reduce workload, and deliver better customer experience.
          </p>

          <motion.button onClick={handleCTA} className="px-8 py-4 bg-indigo-600 text-white rounded-xl text-lg">
            {email ? "Go to Dashboard" : "Get Started Free"}
          </motion.button>
        </motion.div>
      </section>

      <footer className="py-12 text-center text-sm text-zinc-500">
        <p>© {new Date().getFullYear()} SupportSync</p>
      </footer>

    </div>
  );
}

export default HomeClient;