'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreHorizontal,
  Plus,
  Globe,
  Building2,
  MapPin,
  Edit,
  Trash2,
  Activity,
} from "lucide-react";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import CountUp from "@/components/reactbits/CountUp";

// Mock location data
const countries = [
  { id: "BD", name: "Bangladesh", code: "BD", currency: "BDT", language: "Bengali", cities: 8, areas: 45, status: "active" },
  { id: "IN", name: "India", code: "IN", currency: "INR", language: "Hindi", cities: 12, areas: 78, status: "active" },
  { id: "PK", name: "Pakistan", code: "PK", currency: "PKR", language: "Urdu", cities: 6, areas: 32, status: "active" },
];

const cities = [
  { id: 1, name: "Dhaka", country: "Bangladesh", timezone: "Asia/Dhaka", areas: 15, status: "active" },
  { id: 2, name: "Chattogram", country: "Bangladesh", timezone: "Asia/Dhaka", areas: 8, status: "active" },
  { id: 3, name: "Kolkata", country: "India", timezone: "Asia/Kolkata", areas: 12, status: "active" },
  { id: 4, name: "Delhi", country: "India", timezone: "Asia/Kolkata", areas: 18, status: "active" },
  { id: 5, name: "Karachi", country: "Pakistan", timezone: "Asia/Karachi", areas: 10, status: "active" },
];

const areas = [
  { id: 1, name: "Dhanmondi", city: "Dhaka", country: "Bangladesh", status: "active" },
  { id: 2, name: "Gulshan", city: "Dhaka", country: "Bangladesh", status: "active" },
  { id: 3, name: "Mirpur", city: "Dhaka", country: "Bangladesh", status: "active" },
  { id: 4, name: "Salt Lake", city: "Kolkata", country: "India", status: "active" },
  { id: 5, name: "Park Street", city: "Kolkata", country: "India", status: "active" },
];

export default function LocationsPage() {
  const [activeTab, setActiveTab] = useState<'countries' | 'cities' | 'areas'>('countries');

  const stats = [
    { label: "Countries", value: countries.length, color: "text-blue-500", bg: "bg-blue-500/10", icon: Globe },
    { label: "Cities", value: cities.length, color: "text-emerald-500", bg: "bg-emerald-500/10", icon: Building2 },
    { label: "Areas", value: areas.length, color: "text-purple-500", bg: "bg-purple-500/10", icon: MapPin },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">Locations</h1>
          <p className="text-muted-foreground mt-1">
            Manage countries, cities, and areas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            Import CSV
          </Button>
          <Button className="bg-primary hover:bg-red-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Location
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
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </SpotlightCard>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/50 pb-4">
        <Button
          variant={activeTab === 'countries' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('countries')}
          className={activeTab === 'countries' ? 'bg-blue-500 hover:bg-blue-600' : ''}
        >
          <Globe className="w-4 h-4 mr-2" />
          Countries
        </Button>
        <Button
          variant={activeTab === 'cities' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('cities')}
          className={activeTab === 'cities' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
        >
          <Building2 className="w-4 h-4 mr-2" />
          Cities
        </Button>
        <Button
          variant={activeTab === 'areas' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('areas')}
          className={activeTab === 'areas' ? 'bg-purple-500 hover:bg-purple-600' : ''}
        >
          <MapPin className="w-4 h-4 mr-2" />
          Areas
        </Button>
      </div>

      {/* Search */}
      <Card className="glass-card border-border/50">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={`Search ${activeTab}...`}
              className="bg-secondary/50 pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="font-display capitalize">{activeTab}</CardTitle>
        </CardHeader>
        <CardContent>
          {activeTab === 'countries' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Country</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Cities</TableHead>
                  <TableHead>Areas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {countries.map((country) => (
                  <TableRow key={country.id}>
                    <TableCell className="font-medium">{country.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{country.code}</Badge>
                    </TableCell>
                    <TableCell>{country.currency}</TableCell>
                    <TableCell>{country.language}</TableCell>
                    <TableCell>{country.cities}</TableCell>
                    <TableCell>{country.areas}</TableCell>
                    <TableCell>
                      <Badge className="bg-success/10 text-success border-success/30">Active</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                          <DropdownMenuItem>View Cities</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {activeTab === 'cities' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>City</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Timezone</TableHead>
                  <TableHead>Areas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cities.map((city) => (
                  <TableRow key={city.id}>
                    <TableCell className="font-medium">{city.name}</TableCell>
                    <TableCell>{city.country}</TableCell>
                    <TableCell className="text-muted-foreground">{city.timezone}</TableCell>
                    <TableCell>{city.areas}</TableCell>
                    <TableCell>
                      <Badge className="bg-success/10 text-success border-success/30">Active</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                          <DropdownMenuItem>View Areas</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {activeTab === 'areas' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Area</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {areas.map((area) => (
                  <TableRow key={area.id}>
                    <TableCell className="font-medium">{area.name}</TableCell>
                    <TableCell>{area.city}</TableCell>
                    <TableCell>{area.country}</TableCell>
                    <TableCell>
                      <Badge className="bg-success/10 text-success border-success/30">Active</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
