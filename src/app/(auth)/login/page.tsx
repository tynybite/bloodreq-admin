"use client";


import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Facebook, 
  Chrome, 
  Phone, 
  Mail, 
  ArrowRight 
} from "lucide-react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  // Mock Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-left">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 font-display">
          Welcome back
        </h1>
        <p className="text-zinc-500">
          Sign in to your account to continue
        </p>
      </div>

      <Tabs defaultValue="phone" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-zinc-100 p-1 mb-6 h-auto">
          <TabsTrigger value="phone" className="data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm py-2">
            Phone
          </TabsTrigger>
          <TabsTrigger value="email" className="data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm py-2">
            Email
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleLogin} className="space-y-4">
          <TabsContent value="phone" className="space-y-4 mt-0">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-zinc-700">Mobile Number</Label>
              <div className="flex gap-2">
                  <div className="flex h-11 w-20 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-600 font-medium">
                      🇧🇩 +880
                  </div>
                  <Input
                      id="phone"
                      placeholder="1712-345678"
                      required
                      className="bg-zinc-50/50 border-zinc-200 focus-visible:ring-red-600 h-11 text-zinc-900"
                  />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="email" className="space-y-4 mt-0">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-700">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@bloodreq.com"
                required
                className="bg-zinc-50/50 border-zinc-200 focus-visible:ring-red-600 h-11 text-zinc-900"
              />
            </div>
          </TabsContent>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-zinc-700">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-red-600 hover:text-red-700 font-medium hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              required
              className="bg-zinc-50/50 border-zinc-200 focus-visible:ring-red-600 h-11 text-zinc-900"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="remember" className="border-zinc-300 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600 rounded" />
            <Label htmlFor="remember" className="text-sm font-normal text-zinc-600">
              Result verified on this device
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-semibold shadow-red-200 hover:shadow-red-300 transition-all rounded-md"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
            {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </form>
      </Tabs>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-cream px-2 text-zinc-400 font-medium">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" className="h-11 bg-white border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 text-zinc-700">
          <Chrome className="mr-2 h-4 w-4" />
          Google
        </Button>
        <Button variant="outline" className="h-11 bg-white border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 text-zinc-700">
          <Facebook className="mr-2 h-4 w-4 text-blue-600" />
          Facebook
        </Button>
      </div>

      <p className="text-center text-sm text-zinc-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-red-600 hover:text-red-700 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
