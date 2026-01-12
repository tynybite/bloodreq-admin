"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SplitText from "@/components/reactbits/SplitText";
import { Quote } from "lucide-react";

const quotes = [
  {
    text: "The blood you donate gives someone another chance at life.",
    author: "BloodReq Foundation",
  },
  {
    text: "A single drop of blood can make a huge difference.",
    author: "Community Donor",
  },
  {
    text: "Join the network that saves lives every single day.",
    author: "Global Health",
  },
];

export default function AuthSidebar() {
  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative hidden w-full flex-col justify-between bg-zinc-900 p-10 text-white lg:flex h-full min-h-screen">
      {/* Background with Gradient and Noise */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-red-700 via-red-900 to-black" />
      <div className="noise-overlay absolute inset-0 z-0 opacity-20 mix-blend-overlay" />
      
      {/* Abstract Shapes */}
      <div className="absolute top-0 left-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600 blur-3xl opacity-20" />
      <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/3 translate-y-1/3 rounded-full bg-indigo-600 blur-3xl opacity-20" />

      {/* Header / Logo Area */}
      <div className="relative z-10">
        <div className="flex items-center gap-2">
           <div className="h-8 w-8 rounded-full bg-red-600"/>
           <span className="text-2xl font-bold tracking-tight">BloodReq</span>
        </div>
      </div>

      {/* Quote Carousel */}
      <div className="relative z-10 max-w-md">
        <Quote className="mb-6 h-10 w-10 text-red-500/50" />
        <div className="h-40"> {/* Fixed height for carousel */}
            <AnimatePresence mode="wait">
            <motion.div
                key={currentQuote}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
            >
                <h2 className="font-display text-3xl font-medium leading-tight">
                "{quotes[currentQuote].text}"
                </h2>
                <p className="mt-4 text-base font-medium text-red-200">
                — {quotes[currentQuote].author}
                </p>
            </motion.div>
            </AnimatePresence>
        </div>
      </div>

      {/* Footer Area */}
      <div className="relative z-10 flex justify-between text-xs text-red-200/60">
        <p>© 2026 BloodReq Inc.</p>
        <p>Saving Lives Together</p>
      </div>
    </div>
  );
}
