"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Phone, ArrowRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsSent(true);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-left">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 font-display">
          Forgot Password?
        </h1>
        <p className="text-sm text-zinc-500">
          Enter your details to receive a reset code.
        </p>
      </div>

      {!isSent ? (
        <Tabs defaultValue="phone" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-100 p-1 mb-6 h-auto">
              <TabsTrigger value="phone" className="data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm py-2">
              <Phone className="mr-2 h-4 w-4" />
              Phone
              </TabsTrigger>
              <TabsTrigger value="email" className="data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm py-2">
              <Mail className="mr-2 h-4 w-4" />
              Email
              </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-4">
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

              <Button
              type="submit"
              className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md shadow-red-200 hover:shadow-red-300 transition-all rounded-md"
              disabled={isLoading}
              >
              {isLoading ? "Sending Code..." : "Send Reset Code"}
              {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
          </form>
        </Tabs>
      ) : (
        <div className="space-y-6 text-center animate-fade-in py-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600 border border-green-200">
            <Mail className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-zinc-900">Check your inbox</h3>
            <p className="text-sm text-zinc-500">
              We have sent a password reset link to your contact method.
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full border-zinc-200 text-zinc-700 hover:bg-zinc-50 h-11"
            onClick={() => setIsSent(false)}
          >
            Try another method
          </Button>
        </div>
      )}

      <div className="text-center">
        <Link
          href="/login"
          className="inline-flex items-center justify-center text-sm text-zinc-500 hover:text-red-600 transition-colors font-medium "
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Login
        </Link>
      </div>
    </div>
  );
}
