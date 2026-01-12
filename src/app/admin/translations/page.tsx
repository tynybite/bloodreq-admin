'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Languages,
  Plus,
  Check,
  AlertCircle,
  Activity,
} from "lucide-react";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import CountUp from "@/components/reactbits/CountUp";

// Mock translation data
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

export default function TranslationsPage() {
  const [selectedLang, setSelectedLang] = useState("bn");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const stats = [
    { label: "Total Strings", value: 245, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Languages", value: languages.length, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Incomplete", value: translations.filter(t => t.status === 'incomplete').length, color: "text-warning", bg: "bg-warning/10" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">Translations</h1>
          <p className="text-muted-foreground mt-1">
            Manage app translations and languages
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            Export All
          </Button>
          <Button className="bg-primary hover:bg-red-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Language
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <SpotlightCard key={stat.label} className="p-6 border-border/50 bg-card/50 backdrop-blur-md" spotlightColor="rgba(220, 38, 38, 0.1)">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className={`text-3xl font-bold font-display mt-2 ${stat.color}`}>
                  <CountUp to={stat.value} duration={2} />
                </p>
              </div>
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                <Activity className="h-5 w-5" />
              </div>
            </div>
          </SpotlightCard>
        ))}
      </div>

      {/* Language Progress */}
      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="font-display">Language Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {languages.map((lang) => (
              <div
                key={lang.code}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedLang === lang.code ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/50'}`}
                onClick={() => setSelectedLang(lang.code)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <div>
                    <p className="font-medium">{lang.name}</p>
                    <p className="text-xs text-muted-foreground">{lang.code.toUpperCase()}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{Math.round((lang.complete / lang.strings) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${(lang.complete / lang.strings) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{lang.complete} of {lang.strings} strings</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Translation Editor */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* String List */}
        <Card className="glass-card border-border/50 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-display">Strings</CardTitle>
              <Select defaultValue="all">
                <SelectTrigger className="w-[150px] bg-secondary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Strings</SelectItem>
                  <SelectItem value="incomplete">Incomplete</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search strings..." className="bg-secondary/50 pl-10" />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>English</TableHead>
                  <TableHead>{languages.find(l => l.code === selectedLang)?.name}</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {translations.map((t) => (
                  <TableRow
                    key={t.key}
                    className={`cursor-pointer ${selectedKey === t.key ? 'bg-primary/5' : ''}`}
                    onClick={() => setSelectedKey(t.key)}
                  >
                    <TableCell className="font-mono text-xs">{t.key}</TableCell>
                    <TableCell>{t.en}</TableCell>
                    <TableCell className={!(t as any)[selectedLang] ? 'text-muted-foreground italic' : ''}>
                      {(t as any)[selectedLang] || 'Not translated'}
                    </TableCell>
                    <TableCell>
                      {t.status === 'complete' ? (
                        <Badge className="bg-success/10 text-success border-success/30">
                          <Check className="w-3 h-3 mr-1" />
                          Complete
                        </Badge>
                      ) : (
                        <Badge className="bg-warning/10 text-warning border-warning/30">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Incomplete
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Editor Panel */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Languages className="w-5 h-5" />
              Editor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedKey ? (
              <>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Key</p>
                  <p className="font-mono text-xs bg-secondary/50 p-2 rounded">{selectedKey}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">English (Source)</p>
                  <p className="text-sm bg-secondary/50 p-3 rounded">
                    {translations.find(t => t.key === selectedKey)?.en}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">{languages.find(l => l.code === selectedLang)?.name} Translation</p>
                  <Textarea
                    defaultValue={(translations.find(t => t.key === selectedKey) as any)?.[selectedLang] || ''}
                    placeholder="Enter translation..."
                    className="bg-secondary/50"
                    rows={4}
                  />
                </div>
                <Button className="w-full bg-primary hover:bg-red-600">
                  Save Translation
                </Button>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Languages className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a string to edit</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
