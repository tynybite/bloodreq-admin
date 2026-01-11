import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";

// Mock data for dashboard metrics
const metrics = [
  {
    title: "Total Users",
    value: "24,823",
    change: "+12.5%",
    trend: "up",
    icon: Users,
    description: "Registered users",
  },
  {
    title: "Blood Requests",
    value: "1,284",
    change: "+8.2%",
    trend: "up",
    icon: Droplets,
    description: "Active requests",
  },
  {
    title: "Financial Requests",
    value: "342",
    change: "-3.1%",
    trend: "down",
    icon: HandCoins,
    description: "Fundraising campaigns",
  },
  {
    title: "Revenue",
    value: "৳1.2M",
    change: "+23.4%",
    trend: "up",
    icon: Wallet,
    description: "This month",
  },
];

const pendingActions = [
  {
    title: "Blood Requests Pending",
    count: 12,
    icon: Droplets,
    href: "/blood-requests",
  },
  {
    title: "Financial Requests Pending",
    count: 5,
    icon: HandCoins,
    href: "/financial-requests",
  },
  {
    title: "Donations to Verify",
    count: 8,
    icon: CheckCircle2,
    href: "/donations",
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
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s what&apos;s happening with BloodReq.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const TrendIcon = metric.trend === "up" ? TrendingUp : TrendingDown;
          
          return (
            <Card key={metric.title} className="glass-card border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-display">{metric.value}</div>
                <div className="mt-1 flex items-center gap-1 text-xs">
                  <TrendIcon
                    className={`h-3 w-3 ${
                      metric.trend === "up" ? "text-success" : "text-destructive"
                    }`}
                  />
                  <span
                    className={
                      metric.trend === "up" ? "text-success" : "text-destructive"
                    }
                  >
                    {metric.change}
                  </span>
                  <span className="text-muted-foreground">vs last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions & Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pending Actions */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              Pending Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingActions.map((action) => {
              const Icon = action.icon;
              return (
                <div
                  key={action.title}
                  className="flex items-center justify-between rounded-lg bg-secondary/50 p-3 transition-colors hover:bg-secondary"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">{action.title}</span>
                  </div>
                  <Badge variant="destructive" className="font-semibold">
                    {action.count}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="glass-card border-border/50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-1 h-2 w-2 rounded-full ${
                        activity.status === "pending"
                          ? "bg-warning animate-pulse"
                          : activity.status === "verified" || activity.status === "approved"
                          ? "bg-success"
                          : activity.status === "completed"
                          ? "bg-primary"
                          : "bg-muted-foreground"
                      }`}
                    />
                    <div>
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      activity.status === "pending"
                        ? "outline"
                        : activity.status === "verified" || activity.status === "approved"
                        ? "default"
                        : "secondary"
                    }
                    className="text-xs capitalize"
                  >
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Blood Type Distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="font-display">Blood Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {[
                { type: "A+", count: 3421, color: "bg-chart-1" },
                { type: "A-", count: 892, color: "bg-chart-2" },
                { type: "B+", count: 4123, color: "bg-chart-3" },
                { type: "B-", count: 721, color: "bg-chart-4" },
                { type: "O+", count: 5892, color: "bg-chart-5" },
                { type: "O-", count: 1203, color: "bg-chart-1" },
                { type: "AB+", count: 1567, color: "bg-chart-2" },
                { type: "AB-", count: 423, color: "bg-chart-3" },
              ].map((blood) => (
                <div
                  key={blood.type}
                  className="flex flex-col items-center rounded-lg bg-secondary/50 p-4"
                >
                  <div
                    className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full ${blood.color} text-white font-bold`}
                  >
                    {blood.type}
                  </div>
                  <span className="text-lg font-semibold">
                    {blood.count.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">donors</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Countries */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="font-display">Top Regions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Bangladesh", users: 15234, percentage: 62 },
                { name: "India", users: 5892, percentage: 24 },
                { name: "Pakistan", users: 2341, percentage: 9 },
                { name: "Others", users: 1356, percentage: 5 },
              ].map((region) => (
                <div key={region.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{region.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {region.users.toLocaleString()} users
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full gradient-blood transition-all"
                      style={{ width: `${region.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
