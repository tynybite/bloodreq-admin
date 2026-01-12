'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus,
  MoreHorizontal,
  Globe,
  Building2,
  MapPin,
  Edit,
  Trash2,
  Upload,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
const countries = [
  { id: "BD", name: "Bangladesh", code: "BD", currency: "BDT", language: "Bengali", cities: 8, areas: 45, users: 18234, status: "active" },
  { id: "IN", name: "India", code: "IN", currency: "INR", language: "Hindi", cities: 12, areas: 78, users: 4562, status: "active" },
  { id: "PK", name: "Pakistan", code: "PK", currency: "PKR", language: "Urdu", cities: 6, areas: 32, users: 1823, status: "active" },
];

const cities = [
  { id: 1, name: "Dhaka", country: "Bangladesh", timezone: "Asia/Dhaka", areas: 15, users: 12340, status: "active" },
  { id: 2, name: "Chattogram", country: "Bangladesh", timezone: "Asia/Dhaka", areas: 8, users: 3420, status: "active" },
  { id: 3, name: "Kolkata", country: "India", timezone: "Asia/Kolkata", areas: 12, users: 2340, status: "active" },
  { id: 4, name: "Delhi", country: "India", timezone: "Asia/Kolkata", areas: 18, users: 1890, status: "active" },
  { id: 5, name: "Karachi", country: "Pakistan", timezone: "Asia/Karachi", areas: 10, users: 980, status: "active" },
];

const areas = [
  { id: 1, name: "Dhanmondi", city: "Dhaka", country: "Bangladesh", requests: 234, status: "active" },
  { id: 2, name: "Gulshan", city: "Dhaka", country: "Bangladesh", requests: 189, status: "active" },
  { id: 3, name: "Mirpur", city: "Dhaka", country: "Bangladesh", requests: 312, status: "active" },
  { id: 4, name: "Salt Lake", city: "Kolkata", country: "India", requests: 156, status: "active" },
  { id: 5, name: "Park Street", city: "Kolkata", country: "India", requests: 123, status: "active" },
];

const stats = [
  { label: 'Countries', value: countries.length, gradient: 'from-blue-500 to-cyan-400', icon: Globe },
  { label: 'Cities', value: cities.length, gradient: 'from-emerald-500 to-teal-400', icon: Building2 },
  { label: 'Areas', value: areas.length, gradient: 'from-violet-500 to-purple-500', icon: MapPin },
];

export default function LocationsPage() {
  const [activeTab, setActiveTab] = useState<'countries' | 'cities' | 'areas'>('countries');

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
          <h1 className="font-display text-5xl font-bold tracking-tight bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Locations
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Manage countries, cities, and service areas
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl h-11">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" className="rounded-xl h-11">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white text-sm font-medium shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Location
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ y: -2 }}
            className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-6"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${stat.gradient} opacity-10 blur-2xl`} />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-4xl font-bold font-display mt-2">
                  <CountUp to={stat.value} duration={2} />
                </p>
              </div>
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                <stat.icon className="w-7 h-7 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="flex gap-2">
        {[
          { key: 'countries', label: 'Countries', icon: Globe },
          { key: 'cities', label: 'Cities', icon: Building2 },
          { key: 'areas', label: 'Areas', icon: MapPin },
        ].map((tab) => (
          <motion.button
            key={tab.key}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
              activeTab === tab.key 
                ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/25' 
                : 'bg-secondary/50 hover:bg-secondary'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants} className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={`Search ${activeTab}...`}
          className="pl-11 h-12 rounded-xl bg-card/50 border-border/50"
        />
      </motion.div>

      {/* Content Grid */}
      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="wait">
          {activeTab === 'countries' && countries.map((country, i) => (
            <motion.div
              key={country.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-500/20 to-transparent rounded-bl-full" />
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xl">
                    🌍
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{country.name}</h3>
                    <Badge variant="outline">{country.code}</Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                    <DropdownMenuItem>View Cities</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-rose-500"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Currency</p>
                  <p className="font-medium">{country.currency}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Language</p>
                  <p className="font-medium">{country.language}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cities</p>
                  <p className="font-medium">{country.cities}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Users</p>
                  <p className="font-medium">{country.users.toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Active
                </Badge>
                <span className="text-xs text-muted-foreground">{country.areas} areas</span>
              </div>
            </motion.div>
          ))}

          {activeTab === 'cities' && cities.map((city, i) => (
            <motion.div
              key={city.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{city.name}</h3>
                    <p className="text-sm text-muted-foreground">{city.country}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                    <DropdownMenuItem>View Areas</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-rose-500"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Timezone</p>
                  <p className="font-medium text-xs">{city.timezone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Areas</p>
                  <p className="font-medium">{city.areas}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">Active</Badge>
                <span className="text-sm font-medium">{city.users.toLocaleString()} users</span>
              </div>
            </motion.div>
          ))}

          {activeTab === 'areas' && areas.map((area, i) => (
            <motion.div
              key={area.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{area.name}</h3>
                    <p className="text-sm text-muted-foreground">{area.city}, {area.country}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-rose-500"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">Active</Badge>
                <span className="text-sm font-medium">{area.requests} requests</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
