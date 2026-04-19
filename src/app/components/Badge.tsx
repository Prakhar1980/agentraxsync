"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Badge() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 left-6 z-[9999]">

      <motion.button
        onClick={() => setOpen(!open)}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: [0, -6, 0], opacity: 1 }}
        transition={{
          y: {
            repeat: Infinity,
            duration: 2.5,
            ease: "easeInOut",
          },
          opacity: { duration: 0.5 },
        }}
        whileHover={{
          scale: 1.1,
          boxShadow: "0 0 25px rgba(0,0,0,0.6)",
        }}
        whileTap={{ scale: 0.95 }}
        className="group flex items-center gap-2 px-4 py-2 
        bg-gradient-to-r from-black to-gray-800 
        text-white rounded-full text-xs font-medium
        shadow-[0_10px_30px_rgba(0,0,0,0.4)]
        relative overflow-hidden"
      >
        <span className="absolute inset-0 bg-white/10 blur-xl opacity-0 group-hover:opacity-100 transition"></span>

        ⚡ Built by Prakhar
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 180, damping: 15 }}
            className="absolute bottom-16 left-0"
          >
            <div className="
              bg-white/90 backdrop-blur-xl
              rounded-2xl p-4 
              shadow-[0_20px_70px_rgba(0,0,0,0.3)]
              min-w-[250px]
              border border-white/40
            ">

              <p className="text-sm font-semibold text-gray-800">
                Prakhar Kumar 👋
              </p>
              <p className="text-xs text-gray-500 mt-1">
                AI SaaS Builder • Full Stack Dev
              </p>
              <p className="text-[10px] text-gray-400 mt-2">
                Open for freelance • internships • collaboration 🚀
              </p>
              <div className="flex gap-4 mt-4">

                <motion.a
                  whileHover={{ scale: 1.1 }}
                  href="https://github.com/Prakhar1980"
                  target="_blank"
                  className="flex items-center gap-1 text-xs 
                  text-gray-700 hover:text-black transition"
                >
                  🐙 GitHub
                </motion.a>

                <motion.a
                  whileHover={{ scale: 1.1 }}
                  href="https://www.linkedin.com/in/prakharkumar1980"
                  target="_blank"
                  className="flex items-center gap-1 text-xs 
                  text-gray-700 hover:text-blue-600 transition"
                >
                  💼 LinkedIn
                </motion.a>

              </div>
              <motion.a
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                href="https://docs.google.com/forms/d/e/1FAIpQLSf8LxMs_SfG-SQbS0z_arMscYUVG171CYGbzvtb96TL5PKfjg/viewform"
                target="_blank"
                className="relative block mt-4 text-center text-xs font-medium
                bg-gradient-to-r from-black to-gray-800 text-white 
                py-2 rounded-lg overflow-hidden
                shadow-[0_8px_25px_rgba(0,0,0,0.4)]
                hover:shadow-[0_12px_35px_rgba(0,0,0,0.6)]
                transition-all"
              >
                <span className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition"></span>

                Contact / Hire Me 🚀
              </motion.a>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}