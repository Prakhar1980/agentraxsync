'use client'
import axios from "axios";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation"; 
import Badge from "@/app/components/Badge";
import Image from "next/image";


function HomeClient({ email }: { email?: string }) {

  const [loading, setLoading] = useState(false);
  const [agentTimer, setAgentTimer] = useState<number | null>(null);  
 

 const handleLogin = () => {
  setLoading(true);
  window.location.href = "/api/auth/login";  
};

const router = useRouter();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
  const params = new URLSearchParams(window.location.search);

  if (params.get("loggedIn") === "1") {
    window.history.replaceState({}, "", "/");
    window.location.reload(); 
  }
}, []);

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
    <>
    <div className="min-h-screen bg-gradient-to-br from-white via-zinc-50 to-zinc-100 text-zinc-900">
<motion.header
  initial={{ y: -20, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  className="fixed top-0 left-0 w-full z-50 bg-white/60 backdrop-blur-2xl border-b border-gray-200/60"
>
  <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
    <div className="flex items-center gap-3 cursor-pointer group">

      <div className="relative">
        <img
          src="/logo.png"
          alt="Logo"
          className="w-12 h-12 object-contain transition-all duration-500 
                     group-hover:scale-110 group-hover:rotate-3 
                     drop-shadow-sm"
        />
      </div>
      <h1 className="text-xl font-semibold tracking-tight text-gray-900">
        Support<span className="text-indigo-600">Sync</span>
      </h1>
    </div>
    {email ? (
      <div className="relative" ref={dropdownRef}>
        <div
          onClick={() => setOpen(!open)}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 text-white 
                     flex items-center justify-center cursor-pointer shadow-md 
                     hover:scale-105 transition"
        >
          {firstLetter}
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-3 w-52 bg-white/90 backdrop-blur-xl border border-gray-200 
                         rounded-2xl shadow-xl p-2"
            >
              <div className="px-3 py-2 text-xs text-gray-500 border-b">
                {email}
              </div>

              <button
                onClick={() => router.push("/dashboard")}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-100 transition"
              >
                Dashboard
              </button>

              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl transition"
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
  className="px-5 py-2 rounded-full bg-gray-900 text-white 
             hover:bg-gray-800 transition shadow-md
             disabled:opacity-60 disabled:cursor-not-allowed"
>
  {loading ? "Redirecting..." : "Login"}
</button>
    )}
  </div>
</motion.header>
      <main className="max-w-7xl mx-auto px-6 pt-32 grid md:grid-cols-2 gap-12 items-center">
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
<section id="features" className="mt-32 max-w-7xl mx-auto px-6">

 <motion.div {...fadeUp} className="relative text-center mb-16">
  <div className="absolute inset-0 -z-10 flex justify-center">
    <div className="w-[500px] h-[500px] bg-indigo-200/30 blur-3xl rounded-full animate-pulse"></div>
  </div>
  <div className="inline-flex items-center px-4 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-medium mb-6">
    ✨ AI-Powered Support System
  </div>
  <h3 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 max-w-3xl mx-auto leading-tight">
    Powerful features, built for scale
  </h3>
  <p className="mt-5 text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
    Everything you need to automate support, improve response time, and deliver
    a seamless customer experience — without extra complexity.
  </p>

</motion.div>
  <div className="grid md:grid-cols-3 gap-8">
    <motion.div
      {...fadeUp}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm 
                 hover:shadow-xl transition relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition"></div>

      <h4 className="font-semibold text-lg mb-2 relative">
        ⚡ AI Auto Replies
      </h4>
      <p className="text-sm text-gray-600 relative">
        <span className="font-medium text-gray-900">Instant responses</span> to customer queries using intelligent AI trained for support conversations.
      </p>
    </motion.div>


    <motion.div
      {...fadeUp}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm 
                 hover:shadow-xl transition relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition"></div>

      <h4 className="font-semibold text-lg mb-2">
        🌍 Embed Anywhere
      </h4>
      <p className="text-sm text-gray-600">
        Easily integrate using a <span className="font-medium text-gray-900">single script</span> — works on any website or platform.
      </p>
    </motion.div>
    <motion.div
      {...fadeUp}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm 
                 hover:shadow-xl transition relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition"></div>

      <h4 className="font-semibold text-lg mb-2">
        🚀 Smart Escalation
      </h4>
      <p className="text-sm text-gray-600">
        Automatically detects frustration and <span className="font-medium text-gray-900">escalates to human support</span> instantly.
      </p>
    </motion.div>

  </div>
</section>
<section className="mt-32 py-24 relative overflow-hidden">
  <div className="absolute inset-0 -z-10">
    <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-200/30 blur-3xl rounded-full animate-pulse"></div>
    <div className="absolute bottom-0 right-10 w-[400px] h-[400px] bg-blue-200/20 blur-3xl rounded-full animate-pulse"></div>
  </div>

  <div className="max-w-7xl mx-auto px-6 text-center">
    <motion.h3
      {...fadeUp}
      className="text-4xl font-bold mb-4 tracking-tight text-gray-900"
    >
      Why businesses choose SupportSync
    </motion.h3>

    <p className="text-gray-600 max-w-2xl mx-auto mb-16">
      Built for speed, reliability, and intelligent automation — trusted by modern teams.
    </p>
    <div className="grid md:grid-cols-3 gap-10">
      <motion.div
        {...fadeUp}
        whileHover={{ scale: 1.05, y: -5 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="p-8 rounded-2xl bg-white/70 backdrop-blur-xl border border-gray-200 shadow-sm hover:shadow-xl transition"
      >
        <h4 className="text-4xl font-bold text-indigo-600">90%</h4>
        <p className="mt-2 text-gray-600">Queries solved by AI</p>
      </motion.div>

       <motion.div
        {...fadeUp}
        whileHover={{ scale: 1.05, y: -5 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="p-8 rounded-2xl bg-white/70 backdrop-blur-xl border border-gray-200 shadow-sm hover:shadow-xl transition"
      >
        <h4 className="text-4xl font-bold text-indigo-600">24/7</h4>
        <p className="mt-2 text-gray-600">Always available support</p>
      </motion.div>
      <motion.div
        {...fadeUp}
        whileHover={{ scale: 1.05, y: -5 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="p-8 rounded-2xl bg-white/70 backdrop-blur-xl border border-gray-200 shadow-sm hover:shadow-xl transition"
      >
        <h4 className="text-4xl font-bold text-indigo-600">Instant</h4>
        <p className="mt-2 text-gray-600">Human escalation</p>
      </motion.div>

    </div>
 
        </div>
      </section>
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
  <p>
    © {new Date().getFullYear()} SupportSync • Crafted by{" "}
    <span className="text-black font-medium hover:text-indigo-600 transition cursor-pointer">
      Prakhar Kumar
    </span>
  </p>

  <div className="mt-2 flex justify-center gap-4 text-xs">
   
    <a
      href="https://www.linkedin.com/in/prakharkumar1980"
      target="_blank"
      className="hover:text-blue-600 transition"
    >
      LinkedIn
    </a>
  </div>
</footer>

    </div>
    <Badge />

    {loading && (
  <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[9999]">
    <div className="bg-white px-6 py-4 rounded-xl shadow-xl text-sm">
      Logging you in...
    </div>
  </div>
)}
</>

  );
}

export default HomeClient;