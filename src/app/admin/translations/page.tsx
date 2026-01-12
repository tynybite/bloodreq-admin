'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Plus,
  Languages,
  Check,
  AlertCircle,
  Save,
  Download,
  Upload,
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CountUp from "@/components/reactbits/CountUp";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

// Mock data
const translations = [
  { key: "common.welcome", en: "Welcome", bn: "স্বাগতম", hi: "स्वागत है", ur: "خوش آمدید", status: "complete" },
  { key: "common.login", en: "Login", bn: "লগইন", hi: "लॉग इन करें", ur: "لاگ ان", status: "complete" },
  { key: "common.register", en: "Register", bn: "নিবন্ধন", hi: "रजिस्टर करें", ur: "رجسٹر کریں", status: "complete" },
  { key: "blood.request", en: "Request Blood", bn: "রক্তের অনুরোধ", hi: "", ur: "", status: "incomplete" },
  { key: "blood.donate", en: "Donate Blood", bn: "রক্তদান করুন", hi: "रक्तदान करें", ur: "", status: "incomplete" },
  { key: "financial.help", en: "Request Financial Help", bn: "", hi: "", ur: "", status: "incomplete" },
  { key: "notification.nearby", en: "Nearby blood request!", bn: "কাছাকাছি রক্তের অনুরোধ!", hi: "", ur: "", status: "incomplete" },
];

const languages = [
  { code: "en", name: "English", flag: "🇬🇧", strings: 245, complete: 245 },
  { code: "bn", name: "Bengali", flag: "🇧🇩", strings: 245, complete: 198 },
  { code: "hi", name: "Hindi", flag: "🇮🇳", strings: 245, complete: 156 },
  { code: "ur", name: "Urdu", flag: "🇵🇰", strings: 245, complete: 89 },
];

const stats = [
  { label: 'Total Strings', value: 245, gradient: 'from-blue-500 to-cyan-400' },
  { label: 'Languages', value: languages.length, gradient: 'from-violet-500 to-purple-500' },
  { label: 'Incomplete', value: 4, gradient: 'from-amber-500 to-orange-400' },
];

export default function TranslationsPage() {
  const [selectedLang, setSelectedLang] = useState("bn");
  const [selectedKey, setSelectedKey] = useState<string | null>("common.welcome");

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-5xl font-bold tracking-tight bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 bg-clip-text text-transparent">
            Translations
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Manage app translations and localization
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl h-11">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white text-sm font-medium shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-shadow flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Language
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ y: -2 }}
            className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-5"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${stat.gradient} opacity-10 blur-2xl`} />
            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            <p className="text-3xl font-bold font-display mt-1">
              <CountUp to={stat.value} duration={2} />
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Language Cards */}
      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {languages.map((lang) => {
          const progress = (lang.complete / lang.strings) * 100;
          return (
            <motion.div
              key={lang.code}
              whileHover={{ y: -2 }}
              onClick={() => setSelectedLang(lang.code)}
              className={`rounded-2xl border p-5 cursor-pointer transition-all ${
                selectedLang === lang.code 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border/50 bg-card/50 hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{lang.flag}</span>
                <div>
                  <p className="font-semibold">{lang.name}</p>
                  <p className="text-xs text-muted-foreground uppercase">{lang.code}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-teal-500"
                  />
                </div>
                <p className="text-xs text-muted-foreground">{lang.complete} of {lang.strings} strings</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Translation Editor */}
      <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-3">
        {/* String List */}
        <div className="lg:col-span-2 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
          <div className="p-4 border-b border-border/50 flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search strings..." className="pl-10 rounded-xl bg-secondary/50" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[140px] rounded-xl bg-secondary/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Strings</SelectItem>
                <SelectItem value="incomplete">Incomplete</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="divide-y divide-border/50 max-h-[500px] overflow-auto">
            {translations.map((t) => (
              <motion.div
                key={t.key}
                whileHover={{ backgroundColor: 'var(--secondary)' }}
                onClick={() => setSelectedKey(t.key)}
                className={`p-4 cursor-pointer transition-colors ${selectedKey === t.key ? 'bg-primary/5' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <code className="text-xs font-mono text-muted-foreground">{t.key}</code>
                  {t.status === 'complete' ? (
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-xs">
                      <Check className="w-3 h-3 mr-1" />Complete
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-xs">
                      <AlertCircle className="w-3 h-3 mr-1" />Incomplete
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">English</p>
                    <p className="font-medium">{t.en}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">{languages.find(l => l.code === selectedLang)?.name}</p>
                    <p className={`font-medium ${!(t as any)[selectedLang] ? 'text-muted-foreground italic' : ''}`}>
                      {(t as any)[selectedLang] || 'Not translated'}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Editor Panel */}
        <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
              <Languages className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-lg">Editor</h3>
          </div>

          {selectedKey ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Key</p>
                <code className="block p-3 rounded-xl bg-secondary/50 text-xs font-mono">{selectedKey}</code>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">English (Source)</p>
                <p className="p-3 rounded-xl bg-secondary/50 text-sm">
                  {translations.find(t => t.key === selectedKey)?.en}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {languages.find(l => l.code === selectedLang)?.name} Translation
                </p>
                <Textarea
                  defaultValue={(translations.find(t => t.key === selectedKey) as any)?.[selectedLang] || ''}
                  placeholder="Enter translation..."
                  className="rounded-xl bg-secondary/50 min-h-[100px]"
                />
              </div>
              <Button className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600">
                <Save className="w-4 h-4 mr-2" />
                Save Translation
              </Button>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Languages className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a string to edit</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
