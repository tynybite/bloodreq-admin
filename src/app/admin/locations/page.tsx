'use client';

import { useState, useEffect } from 'react';
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
  Loader2,
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

export default function LocationsPage() {
  const [activeTab, setActiveTab] = useState<'countries' | 'cities' | 'areas'>('countries');
  const [countries, setCountries] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('BD');

  // Fetch countries on mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('/api/locations/countries');
        const result = await response.json();
        if (result.success) {
          setCountries(result.data.countries);
          // Set default selected country if we have countries and no selection
          if (result.data.countries.length > 0 && !selectedCountry) {
            setSelectedCountry(result.data.countries[0].code);
          }
        }
      } catch (error) {
        console.error('Error fetching countries:', error);
      } finally {
        // Only stop loading if we're on the countries tab
        if (activeTab === 'countries') {
          setIsLoading(false);
        }
      }
    };
    fetchCountries();
  }, []);

  // Fetch cities when tab is cities or country selection changes
  useEffect(() => {
    if (activeTab === 'cities' && selectedCountry) {
      const fetchCities = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/locations/cities?country=${selectedCountry}`);
          const result = await response.json();
          if (result.success) {
            setCities(result.data.cities);
          }
        } catch (error) {
          console.error('Error fetching cities:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchCities();
    } else if (activeTab === 'countries') {
      setIsLoading(false);
    }
  }, [activeTab, selectedCountry]);

  // Client-side search filters
  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCities = cities.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: 'Countries', value: countries.length, gradient: 'from-blue-500 to-cyan-400', icon: Globe },
    { label: 'Cities', value: cities.length, gradient: 'from-emerald-500 to-teal-400', icon: Building2 },
    { label: 'Areas', value: 0, gradient: 'from-violet-500 to-purple-500', icon: MapPin },
  ];

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
            <Upload className="w-4 h-4 mr-2" /> Import
          </Button>
          <Button variant="outline" className="rounded-xl h-11">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white text-sm font-medium shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Location
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
                <div className="text-4xl font-bold font-display mt-2">
                  <CountUp to={stat.value} duration={2} />
                </div>
              </div>
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                <stat.icon className="w-7 h-7 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Tabs and Filtering */}
      <motion.div variants={itemVariants} className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2">
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
        </div>

        <div className="flex items-center gap-4">
          {activeTab === 'cities' && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Country:</span>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="w-[180px] rounded-xl bg-card/50">
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(country => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="relative w-full max-w-xs">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 rounded-xl bg-card/50 border-border/50"
            />
          </div>
        </div>
      </motion.div>

      {/* Content Grid */}
      <div className="relative min-h-[400px]">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-[2px] z-10 rounded-2xl">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
              <p className="text-sm text-muted-foreground font-medium">Loading {activeTab}...</p>
            </div>
          </div>
        )}

        <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="wait">
            {activeTab === 'countries' && (
              <>
                {filteredCountries.length > 0 ? filteredCountries.map((country, i) => (
                  <motion.div
                    key={country._id || country.code}
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
                          <DropdownMenuItem onClick={() => {
                            setSelectedCountry(country.code);
                            setActiveTab('cities');
                          }}>View Cities</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-rose-500"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <Badge className="mt-1 bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                        </Badge>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Cities</p>
                        <p className="font-semibold mt-1">{(country.cities?.length) || 'N/A'}</p>
                      </div>
                    </div>
                  </motion.div>
                )) : !isLoading && (
                  <div className="col-span-full py-20 text-center text-muted-foreground">
                    No countries found.
                  </div>
                )}
              </>
            )}

            {activeTab === 'cities' && (
              <>
                {filteredCities.length > 0 ? filteredCities.map((city, i) => (
                  <motion.div
                    key={city.slug || i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -4 }}
                    className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white">
                          <Building2 className="w-6 h-6" />
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
                    <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px]">Active</Badge>
                      <span className="text-xs font-mono text-muted-foreground">/{city.slug}</span>
                    </div>
                  </motion.div>
                )) : !isLoading && (
                  <div className="col-span-full py-20 text-center text-muted-foreground">
                    No cities found for {selectedCountry}.
                  </div>
                )}
              </>
            )}

            {activeTab === 'areas' && (
              <div className="col-span-full py-20 text-center text-muted-foreground">
                <MapPin className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Areas API implementation pending.</p>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}
