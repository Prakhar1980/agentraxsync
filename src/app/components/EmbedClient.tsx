"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Badge from "@/app/components/Badge";

type Props = {
  ownerId: string;
};

type BotSettings = {
  businessName: string;
  supportEmail: string;
  knowledge: string;
};

const steps = [
  {
    title: "Copy script",
    text: "Use the secure widget snippet generated for your account.",
  },
  {
    title: "Paste before body",
    text: "Add it once to your website layout or CMS footer.",
  },
  {
    title: "Go live",
    text: "Your chat bubble appears instantly for every visitor.",
  },
];

export default function EmbedClient({ ownerId }: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [settings, setSettings] = useState<BotSettings>({
    businessName: "",
    supportEmail: "",
    knowledge: "",
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.com";

  const embedCode = `<script
  src="${appUrl}/widget.js"
  data-owner-id="${ownerId}"
  data-api-url="${appUrl}/api/chat">
</script>`;

  const copyCode = async () => {
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const fetchSettings = async () => {
      if (!ownerId) return;

      try {
        const res = await fetch(`/api/setting?ownerId=${ownerId}`, {
          cache: "no-store",
        });
        const data = await res.json();

        if (!res.ok) return;

        setSettings({
          businessName: data?.businessName || "",
          supportEmail: data?.supportEmail || "",
          knowledge: data?.knowledge || "",
        });
      } catch (err) {
        console.log("PREVIEW SETTINGS ERROR:", err);
      }
    };

    fetchSettings();
  }, [ownerId]);

  const preview = useMemo(() => {
    const businessName = settings.businessName || "Your Company";
    const supportEmail = settings.supportEmail || "support@yourcompany.com";
    const knowledge =
      settings.knowledge.trim() ||
      "Add pricing, services, policies, timings, FAQs, and support instructions in the dashboard to preview your trained chatbot here.";
    const shortKnowledge =
      knowledge.length > 135 ? `${knowledge.slice(0, 135).trim()}...` : knowledge;
    const domain = businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "your-company";

    return {
      businessName,
      supportEmail,
      knowledge,
      shortKnowledge,
      domain: `${domain}.com`,
      initials: businessName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase() || "AI",
    };
  }, [settings]);

  return (
    <>
      <main className="relative min-h-screen overflow-hidden bg-[#f6f8fb] text-slate-950">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-120px] top-[-120px] h-80 w-80 rounded-full bg-cyan-200/60 blur-3xl" />
          <div className="absolute right-[-90px] top-40 h-96 w-96 rounded-full bg-rose-200/50 blur-3xl" />
          <div className="absolute bottom-[-140px] left-1/3 h-96 w-96 rounded-full bg-amber-200/50 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:42px_42px]" />
        </div>

        <motion.header
          initial={{ y: -18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed left-0 top-0 z-50 w-full border-b border-white/70 bg-white/75 backdrop-blur-xl"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-3"
              aria-label="Go to home"
            >
              <img src="/logo.png" className="h-11 w-11 object-contain" alt="SupportSync logo" />
              <div className="text-left">
                <h1 className="text-lg font-bold tracking-tight">
                  Support<span className="text-cyan-600">Sync</span>
                </h1>
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
                  Widget setup
                </p>
              </div>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push("/dashboard")}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                Dashboard
              </button>
              <button
                onClick={() => router.push("/")}
                className="rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800"
              >
                Home
              </button>
            </div>
          </div>
        </motion.header>

        <section className="relative mx-auto grid max-w-7xl gap-8 px-4 pb-16 pt-28 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-start lg:pt-32">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Ready to install
            </div>

            <div className="space-y-4">
              <h2 className="max-w-xl text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">
                Embed your AI chatbot with a premium website feel.
              </h2>
              <p className="max-w-2xl text-base leading-7 text-slate-600">
                Copy one script, paste it into your site, and launch a polished support widget that looks native on modern web pages.
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-100 bg-white/85 p-5 shadow-sm backdrop-blur">
              <h3 className="text-base font-black text-slate-950">How it works</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {steps.map((step, index) => (
                  <div key={step.title} className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs font-black uppercase tracking-widest text-cyan-700">
                      Step {index + 1}
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-900">{step.title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{step.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-900 bg-slate-950 shadow-[0_24px_70px_rgba(15,23,42,0.28)]">
              <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-400" />
                  <span className="h-3 w-3 rounded-full bg-amber-300" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs font-semibold text-white/70">embed-code.html</span>
                </div>
                <button
                  onClick={copyCode}
                  className="rounded-md bg-white px-3 py-1.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-100"
                >
                  {copied ? "Copied" : "Copy code"}
                </button>
              </div>

              <pre className="max-h-64 overflow-x-auto p-5 text-xs leading-6 text-emerald-300 sm:text-sm">
                {embedCode}
              </pre>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-white/90 p-5 shadow-sm backdrop-blur">
              <p className="text-xs font-black uppercase tracking-widest text-emerald-700">
                {copied ? "Code copied" : "Almost done"}
              </p>
              <h3 className="mt-2 text-xl font-black text-slate-950">
                Thank you for using SupportSync. Congrats, your chatbot is ready to embed.
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Paste the copied script into your website and your support widget will appear for visitors.
              </p>
              <button
                onClick={() => router.push("/")}
                className="mt-4 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800"
              >
                Go to Home
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="relative"
          >
            <div className="overflow-hidden rounded-3xl border border-white/80 bg-white/80 p-3 shadow-[0_30px_100px_rgba(15,23,42,0.18)] backdrop-blur-xl">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-rose-400" />
                    <span className="h-3 w-3 rounded-full bg-amber-300" />
                    <span className="h-3 w-3 rounded-full bg-emerald-400" />
                  </div>
                  <div className="rounded-full border border-slate-200 bg-white px-4 py-1 text-xs font-semibold text-slate-500">
                    {preview.domain}
                  </div>
                  <div className="h-5 w-14" />
                </div>

                <div className="relative min-h-96 overflow-hidden bg-slate-50 p-5">
                  <div className="max-w-md space-y-4">
                    <div className="rounded-2xl bg-slate-950 p-5 text-white shadow-lg">
                      <p className="text-xs font-bold uppercase tracking-widest text-cyan-200">
                        {preview.businessName}
                      </p>
                      <h3 className="mt-3 text-2xl font-black">
                        Simple website preview
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-white/70">
                        The small chat button stays in the corner. Visitors click it to open your support box.
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                          Uses dashboard data
                        </p>
                        <p className="mt-2 text-sm leading-5 text-slate-600">
                          {preview.shortKnowledge}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                          Human support
                        </p>
                        <p className="mt-2 break-words text-sm font-bold text-slate-900">
                          {preview.supportEmail}
                        </p>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {previewOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.94, y: 18 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 12 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-20 right-5 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
                      >
                        <div className="flex items-center justify-between bg-slate-950 px-3 py-3 text-white">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400 text-xs font-black text-slate-950">
                              {preview.initials}
                            </div>
                            <div>
                              <p className="text-sm font-bold leading-tight">{preview.businessName}</p>
                              <p className="text-xs text-emerald-300">Online</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setPreviewOpen(false)}
                            className="rounded-md bg-white/10 px-2 py-1 text-xs font-bold text-white"
                          >
                            Close
                          </button>
                        </div>

                        <div className="h-48 space-y-3 overflow-y-auto bg-slate-50 p-3">
                          <div className="w-fit max-w-56 rounded-2xl rounded-tl-md bg-white px-3 py-2 text-xs leading-5 text-slate-700 shadow-sm">
                            Hi, I can answer questions about {preview.businessName}.
                          </div>
                          <div className="ml-auto w-fit max-w-52 rounded-2xl rounded-tr-md bg-slate-950 px-3 py-2 text-xs leading-5 text-white">
                            What do you know?
                          </div>
                          <div className="w-fit max-w-56 rounded-2xl rounded-tl-md bg-white px-3 py-2 text-xs leading-5 text-slate-700 shadow-sm">
                            {preview.shortKnowledge}
                          </div>
                        </div>

                        <div className="border-t border-slate-100 bg-white p-3">
                          <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2">
                            <span className="flex-1 text-xs text-slate-400">Message...</span>
                            <button className="rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-bold text-white">
                              Send
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={() => setPreviewOpen((open) => !open)}
                    className="absolute bottom-5 right-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500 text-sm font-black text-white shadow-xl transition hover:scale-105"
                    aria-label="Toggle chat preview"
                  >
                    {preview.initials}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <AnimatePresence>
          {copied && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              className="fixed bottom-6 left-1/2 z-[9999] -translate-x-1/2 rounded-full border border-emerald-200 bg-white px-5 py-3 text-sm font-bold text-emerald-700 shadow-[0_18px_50px_rgba(15,23,42,0.16)]"
            >
              Code copied successfully
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Badge />
    </>
  );
}
