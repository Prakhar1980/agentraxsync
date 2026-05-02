"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";

type Props = {
  ownerId: string | null;
  email?: string;
};

const tips = [
  "Copy FAQs from your website, WhatsApp, Instagram DMs, and support emails.",
  "Add pricing, product list, delivery time, refund policy, warranty, and contact rules.",
  "Write answers exactly how your company should reply to customers.",
];

const checklist = [
  "Business name and short brand intro",
  "Products, services, pricing, and offers",
  "Return, refund, cancellation, and warranty rules",
  "Support email, phone, working hours, and escalation steps",
];

export default function DashboardClient({ ownerId, email }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    businessName: "",
    supportEmail: "",
    knowledge: "",
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [saved, setSaved] = useState(false);

  const stats = useMemo(() => {
    const words = form.knowledge.trim().split(/\s+/).filter(Boolean).length;
    const chars = form.knowledge.length;
    const score = Math.min(100, Math.round((words / 180) * 100));
    return { words, chars, score };
  }, [form.knowledge]);

  const fetchSettings = async (showRefresh = false) => {
    if (!ownerId) return;

    if (showRefresh) {
      setRefreshing(true);
      setSaved(false);
    }

    try {
      const res = await fetch(`/api/setting?ownerId=${ownerId}&t=${Date.now()}`, {
        cache: "no-store",
      });
      const data = await res.json();

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
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [ownerId]);

  const saveSettings = async () => {
    if (!ownerId) return;

    setLoading(true);
    setSaved(false);

    try {
      const res = await fetch("/api/setting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ ownerId, ...form }),
      });
      const data = await res.json();

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (!ownerId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-2xl bg-white p-6 text-red-600 shadow-xl">
          Unauthorized - Please login
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <div className="fixed bottom-4 right-4 z-50 rounded-full bg-emerald-500 px-4 py-2 text-xs font-black text-white shadow-xl">
        NEW DASHBOARD UI ACTIVE
      </div>

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <button
            onClick={() => router.push("/")}
            className="text-xl font-black"
          >
            Support<span className="text-cyan-600">Sync</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/embed")}
              className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-lg"
            >
              Embed Chatbot
            </button>
            <button
              onClick={() => router.push("/")}
              className="hidden rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow sm:block"
            >
              Home
            </button>
            {email && (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500 font-black text-white">
                {email.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-white p-7 shadow-xl ring-1 ring-slate-200"
          >
            <div className="inline-flex rounded-full bg-cyan-50 px-3 py-1 text-xs font-black uppercase tracking-widest text-cyan-700">
              Bot training dashboard
            </div>
            <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight">
              Train your chatbot on the details only your company knows.
            </h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              Add your business data here. The embed preview and chatbot use this data to answer customers with your company information.
            </p>

            <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-cyan-200">
                    Knowledge readiness
                  </p>
                  <p className="mt-2 text-sm text-white/60">
                    {stats.words} words, {stats.chars} characters
                  </p>
                </div>
                <p className="text-4xl font-black">{stats.score}%</p>
              </div>
              <div className="mt-4 h-2 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-cyan-400"
                  style={{ width: `${stats.score}%` }}
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="rounded-3xl bg-white p-7 shadow-xl ring-1 ring-slate-200"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-sm font-black text-slate-800">
                  Business Name
                </label>
                <p className="mt-1 text-xs text-slate-500">
                  This appears in chatbot replies and embed preview.
                </p>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                  name="businessName"
                  placeholder="e.g. StepStyle Shoes"
                  value={form.businessName}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="text-sm font-black text-slate-800">
                  Support Email
                </label>
                <p className="mt-1 text-xs text-slate-500">
                  Used when customers need human support.
                </p>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                  name="supportEmail"
                  placeholder="support@company.com"
                  value={form.supportEmail}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="text-sm font-black text-slate-800">
                Company Knowledge Base
              </label>
              <p className="mt-1 text-xs text-slate-500">
                Paste FAQs, pricing, products, services, policies, and customer support instructions.
              </p>
              <textarea
                className="mt-2 min-h-80 w-full resize-none rounded-2xl border border-slate-300 px-4 py-4 leading-7 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                name="knowledge"
                placeholder="Example: Business Identity, products, target customers, pricing, refund rules, delivery time, support instructions..."
                value={form.knowledge}
                onChange={handleChange}
              />
            </div>

            <AnimatePresence>
              {saved && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-700"
                >
                  Settings saved successfully.
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={saveSettings}
                disabled={loading}
                className="rounded-xl bg-slate-950 px-6 py-3 font-black text-white disabled:opacity-60"
              >
                {loading ? "Saving..." : "Save Settings"}
              </button>
              <button
                onClick={() => fetchSettings(true)}
                disabled={refreshing}
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-black text-slate-800 disabled:opacity-60"
              >
                {refreshing ? "Refreshing..." : "Refresh Settings"}
              </button>
            </div>
          </motion.div>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl"
          >
            <p className="text-xs font-black uppercase tracking-widest text-cyan-200">
              Company data tips
            </p>
            <h2 className="mt-3 text-2xl font-black">
              How to get company data for your chatbot
            </h2>
            <div className="mt-5 space-y-3">
              {tips.map((tip, index) => (
                <div key={tip} className="rounded-2xl bg-white/10 p-4">
                  <p className="text-sm font-bold text-cyan-100">Tip {index + 1}</p>
                  <p className="mt-1 text-sm leading-6 text-white/75">{tip}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200"
          >
            <p className="text-xs font-black uppercase tracking-widest text-cyan-700">
              Quick paste checklist
            </p>
            <div className="mt-4 space-y-3">
              {checklist.map((item) => (
                <div key={item} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-cyan-500" />
                  <p className="text-sm leading-6 text-slate-600">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </aside>
      </section>
    </main>
  );
}
