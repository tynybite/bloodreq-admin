'use client';

import SpotlightCard from "@/components/reactbits/SpotlightCard";
import CountUp from "@/components/reactbits/CountUp";
import TiltedCard from "@/components/reactbits/TiltedCard";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Droplets,
  HandCoins,
  Wallet,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  Activity,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";

// Mock data for dashboard metrics
const metrics = [
  {
    title: "Total Users",
    value: 24823,
    prefix: "",
    suffix: "",
    change: "+12.5%",
    trend: "up",
    icon: Users,
    description: "Registered users",
    color: "from-blue-500/20 to-blue-600/5",
    accent: "text-blue-400"
  },
  {
    title: "Blood Requests",
    value: 1284,
    prefix: "",
    suffix: "",
    change: "+8.2%",
    trend: "up",
    icon: Droplets,
    description: "Active requests",
    color: "from-red-500/20 to-red-600/5",
    accent: "text-red-400"
  },
  {
    title: "Financial Requests",
    value: 342,
    prefix: "",
    suffix: "",
    change: "-3.1%",
    trend: "down",
    icon: HandCoins,
    description: "Fundraising campaigns",
    color: "from-orange-500/20 to-orange-600/5",
    accent: "text-orange-400"
  },
  {
    title: "Revenue",
    value: 1200000,
    prefix: "৳",
    suffix: "",
    change: "+23.4%",
    trend: "up",
    icon: Wallet,
    description: "This month",
    color: "from-emerald-500/20 to-emerald-600/5",
    accent: "text-emerald-400"
  },
];

const pendingActions = [
  {
    title: "Blood Requests Pending",
    count: 12,
    icon: Droplets,
    href: "/admin/blood-requests",
    color: "text-red-400"
  },
  {
    title: "Financial Requests Pending",
    count: 5,
    icon: HandCoins,
    href: "/admin/financial-requests",
    color: "text-orange-400"
  },
  {
    title: "Donations to Verify",
    count: 8,
    icon: CheckCircle2,
    href: "/admin/donations",
    color: "text-emerald-400"
  },
];

const recentActivity = [
  {
    type: "blood_request",
    message: "New A+ blood request in Dhaka",
    time: "2 mins ago",
    status: "pending",
  },
  {
    type: "donation",
    message: "৳5,000 donated to Kidney Surgery Fund",
    time: "15 mins ago",
    status: "verified",
  },
  {
    type: "user",
    message: "New user registered: Mohammad Hasan",
    time: "23 mins ago",
    status: "new",
  },
  {
    type: "blood_request",
    message: "O- blood request completed",
    time: "1 hour ago",
    status: "completed",
  },
  {
    type: "financial",
    message: "Financial request approved: Heart Surgery",
    time: "2 hours ago",
    status: "approved",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground drop-shadow-sm">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Overview of your platform's performance and recent activities.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground hover:bg-secondary/80 transition-colors">
            Download Report
          </button>
          <button className="px-4 py-2 bg-primary hover:bg-red-600 text-white rounded-lg text-sm font-medium shadow-lg shadow-primary/25 transition-all">
            Create Request
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, i) => {
          const Icon = metric.icon;
          const TrendIcon = metric.trend === "up" ? TrendingUp : TrendingDown;
          
          return (
            <SpotlightCard 
              key={metric.title} 
              className="p-6 border-border/50 bg-card/50 backdrop-blur-md dark:bg-zinc-900/50"
              spotlightColor="rgba(239, 68, 68, 0.15)"
            >
              <div className="flex justify-between items-start mb-6">
                 <div className={`p-3 rounded-xl bg-gradient-to-br ${metric.color} border border-border/10`}>
                    <Icon className={`h-6 w-6 ${metric.accent}`} />
                 </div>
                 {metric.trend === 'up' ? (
                   <span className="flex items-center text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {metric.change}
                   </span>
                 ) : (
                    <span className="flex items-center text-xs font-medium text-red-500 bg-red-500/10 px-2 py-1 rounded-full border border-red-500/20">
                      <TrendingDown className="w-3 h-3 mr-1" />
                      {metric.change}
                   </span>
                 )}
              </div>
              
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">{metric.title}</h3>
                <div className="text-3xl font-display font-bold text-foreground tracking-tight flex items-baseline gap-1">
                   {metric.prefix}
                   <CountUp 
                     to={metric.value} 
                     separator=","
                     duration={2 + i * 0.2} 
                     className="tabular-nums"
                   />
                   {metric.suffix}
                </div>
              </div>
            </SpotlightCard>
          );
        })}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Activity Feed */}
        <div className="lg:col-span-2 space-y-6">
           <div className="rounded-3xl border border-border/50 bg-card/50 backdrop-blur-md p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-red-500/10 rounded-lg">
                      <Activity className="w-5 h-5 text-red-500" />
                   </div>
                   <h2 className="text-xl font-display font-semibold text-foreground">Recent Activity</h2>
                </div>
                <button className="text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors flex items-center gap-1">
                  View All <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-6">
                {recentActivity.map((activity, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group flex items-center gap-4 p-4 rounded-xl hover:bg-secondary/50 transition-colors border border-transparent hover:border-border/50"
                  >
                    <div className={`mt-1 h-3 w-3 rounded-full flex-shrink-0 ${
                        activity.status === "pending"
                          ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                          : activity.status === "verified" || activity.status === "approved"
                          ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                          : activity.status === "completed"
                          ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                          : "bg-zinc-500"
                      }`} 
                    />
                    <div className="flex-1">
                       <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                         {activity.message}
                       </p>
                       <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                    <Badge variant="outline" className="bg-secondary/50 border-border/50 text-muted-foreground">
                       {activity.status}
                    </Badge>
                  </motion.div>
                ))}
              </div>
           </div>
        </div>

        {/* Right Column: Pending Actions & 3D Card */}
        <div className="space-y-6">
           {/* Pending Actions */}
           <div className="rounded-3xl border border-border/50 bg-card/50 backdrop-blur-md p-6">
               <h3 className="text-lg font-display font-semibold text-foreground mb-6 flex items-center gap-2">
                 <Clock className="w-5 h-5 text-amber-500" />
                 Pending Actions
               </h3>
               <div className="space-y-3">
                  {pendingActions.map((action) => (
                    <div key={action.title} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50 hover:bg-secondary/80 transition-colors cursor-pointer group">
                       <div className="flex items-center gap-3">
                          <action.icon className={`w-4 h-4 ${action.color}`} />
                          <span className="text-sm font-medium text-foreground">{action.title}</span>
                       </div>
                       <div className="h-6 w-6 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
                          {action.count}
                       </div>
                    </div>
                  ))}
               </div>
           </div>

           {/* Featured Promo / Blood Distribution 3D Card */}
           <div className="h-[300px] w-full">
             <TiltedCard
                imageSrc=""
                containerHeight="100%"
                containerWidth="100%"
                imageHeight="100%"
                imageWidth="100%"
                rotateAmplitude={8}
                scaleOnHover={1.05}
                displayOverlayContent={true}
                overlayContent={
                   <div className="h-full w-full flex flex-col justify-end p-6 bg-gradient-to-t from-red-900/90 via-red-900/40 to-transparent rounded-[15px]">
                      <div className="absolute top-6 left-6">
                         <div className="px-3 py-1 bg-red-500 text-white text-xs font-bold uppercase tracking-wider rounded-full w-fit mb-2">
                           Urgent Need
                         </div>
                      </div>
                      <h4 className="text-2xl font-display font-bold text-white mb-2">O- Blood Shortage</h4>
                      <p className="text-sm text-red-100 mb-4">Dhaka region is running low on O- blood. Initiate a campaign to boost donors.</p>
                      <button className="w-full py-3 bg-white text-red-900 font-bold rounded-xl shadow-lg hover:bg-red-50 transition-colors">
                         Launch Campaign
                      </button>
                   </div>
                }
             />
           </div>
        </div>
      </div>
      
      {/* Footer / Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {['A+', 'B+', 'AB+', 'O+'].map(type => (
            <div key={type} className="p-4 rounded-2xl bg-card border border-border/50 flex items-center justify-between shadow-sm">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 font-bold border border-red-500/20">
                    {type}
                  </div>
                  <div className="text-sm text-muted-foreground">Available</div>
               </div>
               <div className="text-xl font-bold text-foreground">
                  <CountUp to={Math.floor(Math.random() * 500) + 100} duration={3} />
               </div>
            </div>
         ))}
      </div>
    </div>
  );
}
