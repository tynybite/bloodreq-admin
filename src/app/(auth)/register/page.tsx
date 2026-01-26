"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowRight, 
  ArrowLeft, 
  User, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2,
  Lock
} from "lucide-react";

const steps = [
  { id: 1, title: "Basic Info", icon: User },
  { id: 2, title: "Location", icon: MapPin },
  { id: 3, title: "Security", icon: Lock },
];

export default function RegisterWizardPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    bloodGroup: "",
    age: "",
    country: "bd",
    city: "",
    area: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
  };

  const progress = (currentStep / 3) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-10 relative"
    >
      {/* Header */}
      <div className="space-y-3 text-left">
         <div className="mono-label px-3 py-1 rounded-full bg-red-600/10 border border-red-600/20 inline-block mb-2">
            Create Account
        </div>
        <h1 className="text-4xl font-display italic text-white">
          Join the Network
        </h1>
        <p className="text-zinc-400 font-sans text-sm">
          Fill out the details below to join our community.
        </p>
      </div>

      {/* Progress Stepper */}
      <div className="space-y-6">
          <div className="flex justify-between px-2">
              {steps.map((step) => {
                  const Icon = step.icon;
                  const isActive = step.id <= currentStep;
                  return (
                      <div key={step.id} className="relative">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-none border-2 transition-all ${isActive ? "border-red-600 bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]" : "border-white/10 bg-transparent text-zinc-600"}`}>
                              <Icon className="h-5 w-5" />
                          </div>
                      </div>
                  )
              })}
          </div>
        <div className="h-[2px] w-full bg-white/5 overflow-hidden">
            <motion.div 
                className="h-full bg-red-600" 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
            />
        </div>
      </div>

      {/* Form Steps */}
      <form onSubmit={handleSubmit} className="min-h-[340px]">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-5"
            >
              <div className="space-y-2">
                  <Label htmlFor="fullName" className="mono-label">Full Name</Label>
                  <Input
                      id="fullName"
                      placeholder="e.g. Rahim Uddin"
                      className="bg-transparent border-white/10 focus:border-red-600 text-white h-12 rounded-none"
                      required
                  />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                       <Label htmlFor="bloodGroup" className="mono-label">Blood Group</Label>
                       <Select>
                          <SelectTrigger className="bg-transparent border-white/10 text-white h-12 rounded-none focus:ring-0">
                              <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0a0a0f] border-white/10 text-white">
                              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                                  <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                              ))}
                          </SelectContent>
                       </Select>
                  </div>
                  <div className="space-y-2">
                       <Label htmlFor="age" className="mono-label">Age</Label>
                       <Input id="age" type="number" placeholder="25" className="bg-transparent border-white/10 text-white h-12 rounded-none focus:border-red-600" />
                  </div>
              </div>
              <div className="flex items-center space-x-3 pt-2">
                  <Checkbox id="donor" defaultChecked className="border-white/20 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600 rounded-none" />
                  <Label htmlFor="donor" className="cursor-pointer text-zinc-500 uppercase tracking-widest text-[10px] font-bold">I am available to help</Label>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-5"
            >
               <Button variant="outline" className="w-full h-12 bg-transparent border-white/10 text-red-500 hover:bg-white/5 hover:border-red-600 rounded-none transition-all uppercase tracking-widest text-[10px] font-bold" type="button">
                  <MapPin className="mr-2 h-4 w-4" />
                  Detect My Location
               </Button>
               <div className="relative flex justify-center text-[9px] uppercase tracking-[0.3em] font-medium my-4">
                  <span className="bg-[#020205] px-4 text-zinc-600">Enter details manually</span>
               </div>
               <div className="grid gap-5">
                  <div className="space-y-2">
                       <Label className="mono-label">Country</Label>
                       <Select defaultValue="bd">
                          <SelectTrigger className="bg-transparent border-white/10 text-white h-12 rounded-none"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-[#0a0a0f] border-white/10 text-white">
                              <SelectItem value="bd">Bangladesh</SelectItem>
                              <SelectItem value="in">India</SelectItem>
                          </SelectContent>
                       </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                          <Label className="mono-label">City</Label>
                          <Input placeholder="Dhaka" className="bg-transparent border-white/10 text-white h-12 rounded-none focus:border-red-600" />
                      </div>
                      <div className="space-y-2">
                          <Label className="mono-label">Area</Label>
                          <Input placeholder="Dhanmondi" className="bg-transparent border-white/10 text-white h-12 rounded-none focus:border-red-600" />
                      </div>
                  </div>
               </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-5"
            >
               <div className="space-y-2">
                  <Label className="mono-label">Email Address</Label>
                  <Input type="email" placeholder="admin@bloodreq.com" className="bg-transparent border-white/10 text-white h-12 rounded-none focus:border-red-600" />
               </div>
               <div className="space-y-2">
                  <Label className="mono-label">Password</Label>
                  <Input type="password" placeholder="Min 8 characters" className="bg-transparent border-white/10 text-white h-12 rounded-none focus:border-red-600" />
               </div>
               <div className="space-y-2">
                  <Label className="mono-label">Confirm Password</Label>
                  <Input type="password" placeholder="Matching entry" className="bg-transparent border-white/10 text-white h-12 rounded-none focus:border-red-600" />
               </div>
               
               <div className="flex items-center space-x-3 pt-2">
                  <Checkbox id="terms" required className="border-white/20 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600 rounded-none" />
                  <Label htmlFor="terms" className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest cursor-pointer">
                      I accept the terms and conditions
                  </Label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-4">
          <Button
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={currentStep === 1 ? "invisible" : "mono-label opacity-50 hover:opacity-100 hover:bg-transparent"}
          >
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          
          {currentStep < 3 ? (
              <Button onClick={nextStep} className="bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-red-600 transition-all rounded-none px-8 h-12 uppercase tracking-widest text-xs">
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
          ) : (
              <Button 
                  onClick={handleSubmit} 
                  className="bg-red-600 text-white hover:bg-red-700 shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all rounded-none px-8 h-12 uppercase tracking-widest text-xs border border-red-500/50"
                  disabled={isLoading}
              >
                  {isLoading ? "Saving..." : "Complete Registration"}
              </Button>
          )}
      </div>

      <p className="mt-8 text-center text-[11px] text-zinc-500 uppercase tracking-widest">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-red-500 hover:text-red-400 underline decoration-red-500/30 underline-offset-4">
          Sign In
        </Link>
      </p>
    </motion.div>
  );
}
