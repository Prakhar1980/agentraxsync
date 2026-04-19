"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Badge from "@/app/components/Badge";

type Props = {
  ownerId: string;
};

export default function EmbedClient({ ownerId }: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

  const embedCode = `<script
  src="${APP_URL}/widget.js"
  data-owner-id="${ownerId}"
  data-api-url="${APP_URL}/api/chat">
</script>`;

  const copyCode = async () => {
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
     <>
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 w-full z-50 bg-white/70 backdrop-blur-xl"
      >
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4 py-4">

          <div className="flex items-center gap-3 cursor-pointer">
            <img src="/logo.png" className="w-12 h-12 object-contain" />
            <h1 className="text-xl font-semibold">
              Support<span className="text-indigo-600">Sync</span>
            </h1>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 transition"
            >
              ← Dashboard
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:opacity-80 transition"
            >
              Home
            </button>
          </div>

        </div>
      </motion.header>
      <div className="pt-28 px-4 pb-16">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 backdrop-blur-2xl rounded-3xl 
            shadow-[0_20px_80px_rgba(0,0,0,0.15)] 
            p-8 space-y-8"
          >
            <div>
              <h2 className="text-3xl font-bold">
                🌐 Embed Your Chatbot
              </h2>
              <p className="text-gray-500 text-sm mt-2">
                Copy and paste this script before {"</body>"}
              </p>
            </div>
            <div className="bg-black rounded-2xl overflow-hidden shadow-lg">
              <div className="flex justify-between items-center px-4 py-3 bg-white/10 backdrop-blur">
                <span className="text-sm text-white/80">Embed Code</span>
                <button
                  onClick={copyCode}
                  className="text-xs bg-white text-black px-3 py-1 rounded-md hover:scale-105 transition"
                >
                  {copied ? "Copied ✅" : "Copy"}
                </button>
              </div>

              <pre className="p-4 text-xs text-green-400 overflow-x-auto">
                {embedCode}
              </pre>
            </div>
            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl p-5">
              <h3 className="font-semibold text-indigo-600">
                ⚡ How it works
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Add script → chatbot appears instantly on your site.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Live Preview
              </h3>

              <div className="relative bg-gradient-to-br from-gray-100 via-white to-gray-200 
              rounded-2xl h-[520px] overflow-hidden shadow-inner">

              
                <div className="bg-white/80 backdrop-blur px-4 py-2 text-sm text-gray-500 shadow-sm">
                  your-website.com
                </div>

                <div className="p-6 text-gray-400 text-sm">
                  Your website content...
                </div>
<motion.div
  initial={{ opacity: 0, scale: 0.8, y: 40 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  transition={{ duration: 0.3 }}
  className="absolute bottom-4 right-4"
>

  <div className="w-[300px] h-[420px] bg-white rounded-2xl 
  shadow-[0_20px_60px_rgba(0,0,0,0.35)] flex flex-col overflow-hidden">


    <div className="bg-black text-white px-3 py-2 flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center text-xs font-bold">
        AI
      </div>
      <div>
        <p className="text-sm font-semibold leading-tight">Support</p>
        <p className="text-[10px] text-green-400">● Online</p>
      </div>
    </div>


    <div className="flex-1 p-3 space-y-3 bg-gray-50 overflow-y-auto">

      <div className="bg-white px-2 py-1.5 rounded-lg text-xs shadow w-fit max-w-[75%]">
        Hi 👋 How can I help?
      </div>

      <div className="bg-black text-white px-2 py-1.5 rounded-lg text-xs ml-auto w-fit max-w-[75%]">
        Pricing?
      </div>

      <div className="bg-white px-2 py-1.5 rounded-lg text-xs shadow w-fit max-w-[75%]">
        Starts from ₹499/month 👍
      </div>

    </div>
    <div className="p-2 bg-white">
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-2 py-1">
        <input
          placeholder="Message..."
          className="flex-1 bg-transparent outline-none text-xs"
        />
        <button className="bg-black text-white px-2 py-1 rounded text-xs">
          Send
        </button>
      </div>
    </div>

  </div>
<motion.div
  initial={{ scale: 0, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ duration: 0.3 }}
  className="fixed bottom-6 right-6 z-[9999]"
>
  <button className="w-14 h-14 bg-black text-white rounded-full 
  flex items-center justify-center 
  shadow-[0_10px_30px_rgba(0,0,0,0.4)]
  hover:scale-110 active:scale-95 transition">
    💬
  </button>
</motion.div>

</motion.div>
              </div>
            </div>

          </motion.div>

          {/* STATUS */}
          <AnimatePresence>
            {copied && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 text-center text-green-600 text-sm"
              >
                ✔ Copied successfully
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

    </div>
    <Badge />
    </>
 
  );
}
