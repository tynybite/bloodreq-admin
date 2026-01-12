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
  Phone,
  CheckCircle2 
} from "lucide-react";

const steps = [
  { id: 1, title: "Identity", icon: Phone },
  { id: 2, title: "Basic Info", icon: User },
  { id: 3, title: "Location", icon: MapPin },
  { id: 4, title: "Security", icon: ShieldCheck },
];

export default function RegisterWizardPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock Form Data State
  const [formData, setFormData] = useState({
    phone: "",
    otp: "",
    fullName: "",
    bloodGroup: "",
    age: "",
    country: "",
    city: "",
    area: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    // Redirect logic would go here
  };

  const progress = (currentStep / 4) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2 text-left">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 font-display">
          Join the Network
        </h1>
        <p className="text-sm text-zinc-500">
          Become a donor or request assistance in minutes.
        </p>
      </div>

      {/* Progress Stepper */}
      <div className="space-y-4">
          <div className="flex justify-between px-1">
              {steps.map((step) => {
                  const Icon = step.icon;
                  const isActive = step.id <= currentStep;
                  return (
                      <div key={step.id} className={`flex flex-col items-center gap-2 transition-colors ${isActive ? "text-red-600" : "text-zinc-400"}`}>
                          <div className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all ${isActive ? "border-red-600 bg-red-50 text-red-600" : "border-zinc-200 bg-white text-zinc-400"}`}>
                              <Icon className="h-4 w-4" />
                          </div>
                      </div>
                  )
              })}
          </div>
        <Progress value={progress} className="h-1 bg-zinc-100" />
      </div>

      {/* Form Steps */}
      <form onSubmit={handleSubmit} className="min-h-[320px]">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
               <div className="space-y-4">
                  <div className="space-y-2">
                      <Label htmlFor="phone" className="text-zinc-700">Mobile Number</Label>
                      <div className="flex gap-2">
                          <div className="flex h-11 w-20 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-600 font-medium">
                              🇧🇩 +880
                          </div>
                          <Input
                              id="phone"
                              placeholder="1712-345678"
                              value={formData.phone}
                              onChange={(e) => setFormData({...formData, phone: e.target.value})}
                              required
                              className="bg-zinc-50/50 border-zinc-200 focus-visible:ring-red-600 h-11 text-zinc-900"
                          />
                      </div>
                  </div>
                  {formData.phone.length > 9 && (
                      <div className="space-y-2 animate-fade-in">
                          <Label htmlFor="otp" className="text-zinc-700">Enter Verification Code</Label>
                          <Input
                              id="otp"
                              placeholder="• • • • • •"
                              maxLength={6}
                              className="bg-zinc-50/50 border-zinc-200 text-center tracking-[0.5em] font-mono text-lg text-zinc-900 focus-visible:ring-red-600 h-11"
                          />
                          <p className="text-xs text-zinc-500">We sent a code to your number.</p>
                      </div>
                  )}
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-zinc-700">Full Name</Label>
                  <Input
                      id="fullName"
                      placeholder="e.g. Rahim Uddin"
                      className="bg-zinc-50/50 border-zinc-200 text-zinc-900 focus-visible:ring-red-600 h-11"
                      required
                  />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                       <Label htmlFor="bloodGroup" className="text-zinc-700">Blood Group</Label>
                       <Select>
                          <SelectTrigger className="bg-zinc-50/50 border-zinc-200 text-zinc-900 focus:ring-red-600 h-11">
                              <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-zinc-200">
                              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                                  <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                              ))}
                          </SelectContent>
                       </Select>
                  </div>
                  <div className="space-y-2">
                       <Label htmlFor="age" className="text-zinc-700">Age</Label>
                       <Input id="age" type="number" placeholder="25" className="bg-zinc-50/50 border-zinc-200 text-zinc-900 focus-visible:ring-red-600 h-11" />
                  </div>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                  <Checkbox id="donor" defaultChecked className="border-zinc-300 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600 rounded" />
                  <Label htmlFor="donor" className="cursor-pointer text-zinc-700">I am available to donate blood</Label>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
               <Button variant="outline" className="w-full h-11 bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-red-600" type="button">
                  <MapPin className="mr-2 h-4 w-4" />
                  Auto-detect Location
               </Button>
               <div className="relative flex justify-center text-xs uppercase my-2">
                  <span className="bg-cream px-2 text-zinc-400 font-medium">Or Select Manually</span>
               </div>
               <div className="grid gap-4">
                  <div className="space-y-2">
                       <Label className="text-zinc-700">Country</Label>
                       <Select defaultValue="bd">
                          <SelectTrigger className="bg-zinc-50/50 border-zinc-200 text-zinc-900 focus:ring-red-600 h-11"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-white border-zinc-200">
                              <SelectItem value="bd">Bangladesh</SelectItem>
                              <SelectItem value="in">India</SelectItem>
                          </SelectContent>
                       </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                          <Label className="text-zinc-700">City</Label>
                          <Input placeholder="Dhaka" className="bg-zinc-50/50 border-zinc-200 text-zinc-900 focus-visible:ring-red-600 h-11" />
                      </div>
                      <div className="space-y-2">
                          <Label className="text-zinc-700">Area</Label>
                          <Input placeholder="Dhanmondi" className="bg-zinc-50/50 border-zinc-200 text-zinc-900 focus-visible:ring-red-600 h-11" />
                      </div>
                  </div>
               </div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
               <div className="space-y-2">
                  <Label className="text-zinc-700">Password</Label>
                  <Input type="password" placeholder="Min 8 characters" className="bg-zinc-50/50 border-zinc-200 text-zinc-900 focus-visible:ring-red-600 h-11" />
               </div>
               <div className="space-y-2">
                  <Label className="text-zinc-700">Confirm Password</Label>
                  <Input type="password" placeholder="Confirm password" className="bg-zinc-50/50 border-zinc-200 text-zinc-900 focus-visible:ring-red-600 h-11" />
               </div>
               
               <div className="rounded-lg bg-zinc-50 border border-zinc-100 p-4 text-xs space-y-2 mt-4">
                  <p className="font-semibold mb-2 text-zinc-900">Password Requirements:</p>
                  <div className="flex items-center gap-2 text-green-600 font-medium"><CheckCircle2 className="h-3 w-3" /> At least 8 characters</div>
                  <div className="flex items-center gap-2 text-zinc-500"><CheckCircle2 className="h-3 w-3" /> One number</div>
                  <div className="flex items-center gap-2 text-zinc-500"><CheckCircle2 className="h-3 w-3" /> One special character</div>
               </div>

               <div className="flex items-center space-x-2 pt-2">
                  <Checkbox id="terms" required className="border-zinc-300 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600 rounded" />
                  <Label htmlFor="terms" className="text-xs font-normal text-zinc-600">
                      I agree to the Terms of Service and Privacy Policy
                  </Label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
          <Button
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={currentStep === 1 ? "invisible" : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"}
          >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          
          {currentStep < 4 ? (
              <Button onClick={nextStep} className="bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-200 transition-all">
                  Next Step <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
          ) : (
              <Button 
                  onClick={handleSubmit} 
                  className="bg-green-600 text-white hover:bg-green-700 shadow-md shadow-green-200 transition-all"
                  disabled={isLoading}
              >
                  {isLoading ? "Creating..." : "Complete Registration"}
              </Button>
          )}
      </div>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-red-600 hover:text-red-700 hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}
