'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell,
  Globe,
  Shield,
  Palette,
  Key,
  Save,
} from "lucide-react";
import SpotlightCard from "@/components/reactbits/SpotlightCard";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">
            Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure platform settings and preferences.
          </p>
        </div>
        <Button className="bg-primary hover:bg-red-600 text-white">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* General Settings */}
        <SpotlightCard className="p-0 border-border/50 bg-card/50 backdrop-blur-md" spotlightColor="rgba(220, 38, 38, 0.1)">
          <CardHeader className="p-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-foreground">General Settings</CardTitle>
                <CardDescription>Basic platform configuration</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform-name">Platform Name</Label>
              <Input id="platform-name" defaultValue="BloodReq" className="bg-secondary/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="support-email">Support Email</Label>
              <Input id="support-email" type="email" defaultValue="support@bloodreq.com" className="bg-secondary/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="default-language">Default Language</Label>
              <Select defaultValue="en">
                <SelectTrigger className="bg-secondary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="bn">Bengali</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                  <SelectItem value="ur">Urdu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Default Timezone</Label>
              <Select defaultValue="asia-dhaka">
                <SelectTrigger className="bg-secondary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asia-dhaka">Asia/Dhaka (GMT+6)</SelectItem>
                  <SelectItem value="asia-kolkata">Asia/Kolkata (GMT+5:30)</SelectItem>
                  <SelectItem value="asia-karachi">Asia/Karachi (GMT+5)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </SpotlightCard>

        {/* Notification Settings */}
        <SpotlightCard className="p-0 border-border/50 bg-card/50 backdrop-blur-md" spotlightColor="rgba(220, 38, 38, 0.1)">
          <CardHeader className="p-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Bell className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <CardTitle className="text-foreground">Notifications</CardTitle>
                <CardDescription>Configure notification preferences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Send push notifications for new requests</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">Send SMS for critical updates</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Send email digests to admins</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notification-radius">Default Notification Radius</Label>
              <Select defaultValue="25">
                <SelectTrigger className="bg-secondary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 km</SelectItem>
                  <SelectItem value="10">10 km</SelectItem>
                  <SelectItem value="25">25 km</SelectItem>
                  <SelectItem value="50">50 km</SelectItem>
                  <SelectItem value="100">100 km</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </SpotlightCard>

        {/* Security Settings */}
        <SpotlightCard className="p-0 border-border/50 bg-card/50 backdrop-blur-md" spotlightColor="rgba(220, 38, 38, 0.1)">
          <CardHeader className="p-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Shield className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <CardTitle className="text-foreground">Security</CardTitle>
                <CardDescription>Security and access control</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Require 2FA for admin access</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>IP Restriction</Label>
                <p className="text-sm text-muted-foreground">Restrict admin access by IP</p>
              </div>
              <Switch />
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-timeout">Session Timeout</Label>
              <Select defaultValue="30">
                <SelectTrigger className="bg-secondary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </SpotlightCard>

        {/* Appearance Settings */}
        <SpotlightCard className="p-0 border-border/50 bg-card/50 backdrop-blur-md" spotlightColor="rgba(220, 38, 38, 0.1)">
          <CardHeader className="p-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Palette className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <CardTitle className="text-foreground">Appearance</CardTitle>
                <CardDescription>Customize the look and feel</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            <div className="space-y-2">
              <Label>Default Theme</Label>
              <Select defaultValue="light">
                <SelectTrigger className="bg-secondary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="flex gap-2">
                {['#dc2626', '#ea580c', '#16a34a', '#2563eb', '#7c3aed'].map((color) => (
                  <button
                    key={color}
                    className="w-8 h-8 rounded-full border-2 border-transparent hover:border-foreground/50 transition-colors"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Animations</Label>
                <p className="text-sm text-muted-foreground">Enable UI animations</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </SpotlightCard>

        {/* API Keys */}
        <SpotlightCard className="p-0 border-border/50 bg-card/50 backdrop-blur-md lg:col-span-2" spotlightColor="rgba(220, 38, 38, 0.1)">
          <CardHeader className="p-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Key className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-foreground">API Keys</CardTitle>
                <CardDescription>Manage third-party integrations</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="supabase-url">Supabase URL</Label>
                <Input id="supabase-url" type="text" defaultValue="https://*****.supabase.co" className="bg-secondary/50" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supabase-key">Supabase Anon Key</Label>
                <Input id="supabase-key" type="password" defaultValue="eyJhbGciOiJI..." className="bg-secondary/50" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admob-id">AdMob App ID</Label>
                <Input id="admob-id" type="text" placeholder="ca-app-pub-XXXXXXXX" className="bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook-app-id">Facebook App ID</Label>
                <Input id="facebook-app-id" type="text" placeholder="Enter Facebook App ID" className="bg-secondary/50" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              ⚠️ Some keys are managed via environment variables and cannot be changed here.
            </p>
          </CardContent>
        </SpotlightCard>
      </div>
    </div>
  );
}
