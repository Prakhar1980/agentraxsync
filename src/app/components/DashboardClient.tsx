"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

type Props = {
  ownerId: string | null;
  email?: string;
};

export default function DashboardClient({ ownerId, email }: Props) {
  const router = useRouter();

  const [form, setForm] = useState({
    businessName: "",
    supportEmail: "",
    knowledge: "",
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const firstLetter = email?.charAt(0).toUpperCase() || "U";

  // 🔥 FETCH SETTINGS (UPDATED)
  const fetchSettings = async () => {
    if (!ownerId) return;

    try {
      const res = await fetch(`/api/setting?ownerId=${ownerId}`);

      const text = await res.text();
      const data = JSON.parse(text);

      if (!res.ok) {
        console.log(data?.error);
        return;
      }

      setForm({
        businessName: data?.businessName || "",
        supportEmail: data?.supportEmail || "",
        knowledge: data?.knowledge || "",
      });
    } catch (err) {
      console.log("FETCH ERROR:", err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [ownerId]);

  // 🔥 SAVE SETTINGS (UPDATED)
  const saveSettings = async () => {
    if (!ownerId) return;

    console.log("Saving...", ownerId);

    setLoading(true);
    setSaved(false);

    try {
      const res = await fetch("/api/setting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ownerId,
          ...form,
        }),
      });

      const text = await res.text();
      console.log("RAW RESPONSE:", text);

      const data = JSON.parse(text);

      if (!res.ok) {
        console.log(data?.error);
        return;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.log("SAVE ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 HANDLE CHANGE
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // 🔥 AUTH CHECK
  if (!ownerId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 font-semibold">
          Unauthorized - Please login
        </p>
      </div>
    );
  }

  // ✅ ONLY FIX ADDED HERE
  return (
    <div className="min-h-screen bg-gray-100">

      {/* ================= NAVBAR ================= */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 py-4">

          <h1
            onClick={() => router.push("/")}
            className="text-lg sm:text-xl font-bold cursor-pointer"
          >
            Support<span className="text-indigo-600">Sync</span>
          </h1>

          <div className="flex items-center gap-3">

            <button
              onClick={() => router.push("/embed")}
              className="hidden sm:block px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Embed Chatbot
            </button>

            <button
              onClick={() => router.push("/")}
              className="hidden sm:block px-4 py-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 transition"
            >
              Home
            </button>

            {email && (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center">
                {firstLetter}
              </div>
            )}

          </div>
        </div>
      </motion.header>

      {/* ================= CONTENT ================= */}
      <div className="pt-24 px-4 sm:px-6 pb-10">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* HEADER */}
          <div className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition">
            <h1 className="text-2xl font-bold">AI Chatbot Dashboard ⚡</h1>
            <p className="text-gray-500 text-sm mt-1">
              Configure your AI assistant to respond like your business
            </p>
          </div>

          {/* MAIN CARD */}
          <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-5 hover:shadow-md transition">

            {/* BUSINESS NAME */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Business Name
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Shown in chatbot replies
              </p>
              <input
                className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. SupportSync AI"
                name="businessName"
                value={form.businessName}
                onChange={handleChange}
              />
            </div>

            {/* SUPPORT EMAIL */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Support Email
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Used when chatbot escalates
              </p>
              <input
                className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="support@company.com"
                name="supportEmail"
                value={form.supportEmail}
                onChange={handleChange}
              />
            </div>

            {/* KNOWLEDGE BASE */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Knowledge Base
              </label>
              <textarea
                className="w-full border rounded-xl p-3 h-44 resize-none outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Add FAQs, policies, pricing..."
                name="knowledge"
                value={form.knowledge}
                onChange={handleChange}
              />
            </div>

            {/* SUCCESS MESSAGE */}
            <AnimatePresence>
              {saved && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-green-700 text-sm font-medium bg-green-50 border border-green-200 p-3 rounded-xl"
                >
                  Settings saved successfully ✅
                </motion.div>
              )}
            </AnimatePresence>

            {/* BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">

              <button
                type="button"
                onClick={saveSettings}
                disabled={loading}
                className="w-full sm:w-auto bg-black text-white px-5 py-3 rounded-xl"
              >
                {loading ? "Saving..." : "Save Settings"}
              </button>

              <button
                type="button"
                onClick={fetchSettings}
                className="w-full sm:w-auto bg-gray-100 border px-5 py-3 rounded-xl"
              >
                Refresh
              </button>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}