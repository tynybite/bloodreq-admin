"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress"; // Fixed import
import {
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Eye,
  HandCoins,
  TrendingUp,
  AlertCircle,
  Clock,
  FileText,
  DollarSign,
  Calendar,
} from "lucide-react";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import SplitText from "@/components/reactbits/SplitText";

// Mock Data
const financialRequests = [
  {
    id: "FR-001",
    title: "Urgent Heart Surgery Support",
    patientName: "Rahim Uddin",
    category: "Surgery",
    amountNeeded: 500000,
    amountRaised: 325000,
    currency: "BDT",
    deadline: "2026-02-15",
    status: "fundraising",
    urgency: "critical",
    hospital: "National Heart Foundation",
    description: "My father requires urgent bypass surgery. We have gathered 60% of the funds but need support for the rest.",
    documents: ["Hospital Bill", "Angiogram Report", "NID Copy"],
    createdAt: "2026-01-05",
  },
  {
    id: "FR-002",
    title: "Kidney Transplant Fund",
    patientName: "Fatema Begum",
    category: "Transplant",
    amountNeeded: 1200000,
    amountRaised: 0,
    currency: "BDT",
    deadline: "2026-03-01",
    status: "pending",
    urgency: "urgent",
    hospital: "Kidney Foundation",
    description: "Seeking financial aid for kidney transplant. Mother of three, sole earner of the family.",
    documents: ["Doctor Recommendation", "Income Certificate"],
    createdAt: "2026-01-10",
  },
  {
    id: "FR-003",
    title: "Chemotherapy Cycle 1",
    patientName: "Sujit Kumar",
    category: "Cancer Treatment",
    amountNeeded: 80000,
    amountRaised: 80000,
    currency: "BDT",
    deadline: "2026-01-20",
    status: "completed",
    urgency: "high",
    hospital: "Delta Hospital",
    description: "First cycle of chemotherapy for lung cancer diagnosis.",
    documents: ["Biopsy Report", "Hospital Estimate"],
    createdAt: "2025-12-28",
  },
  {
    id: "FR-004",
    title: "Accident Emergency Care",
    patientName: "Unknown (Road Victim)",
    category: "Emergency",
    amountNeeded: 50000,
    amountRaised: 12000,
    currency: "BDT",
    deadline: "2026-01-14",
    status: "fundraising",
    urgency: "critical",
    hospital: "DMCH",
    description: "Emergency fund for road accident victim currently in ICU. Identity verification in progress.",
    documents: ["Police Report", "Hospital Admission"],
    createdAt: "2026-01-11",
  },
  {
    id: "FR-005",
    title: "Thalassemia Medication",
    patientName: "Anika Tabassum",
    category: "Medication",
    amountNeeded: 15000,
    amountRaised: 15000,
    currency: "BDT",
    deadline: "2026-01-10",
    status: "approved",
    urgency: "medium",
    hospital: "Thalassemia Center",
    description: "Monthly medication support for 8-year-old child.",
    documents: ["Prescription", "Birth Certificate"],
    createdAt: "2026-01-08",
  },
];

// Helper functions for styling
const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-warning/10 text-warning border-warning/30";
    case "approved":
      return "bg-blue-500/10 text-blue-500 border-blue-500/30";
    case "fundraising":
      return "bg-primary/10 text-primary border-primary/30";
    case "completed":
      return "bg-success/10 text-success border-success/30";
    case "rejected":
      return "bg-destructive/10 text-destructive border-destructive/30";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getProgressColor = (percent: number) => {
  if (percent >= 100) return "bg-success";
  if (percent >= 50) return "bg-primary";
  return "bg-warning";
};

export default function FinancialRequestsPage() {
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredRequests = financialRequests.filter(
    (req) => filterStatus === "all" || req.status === filterStatus
  );

  const stats = [
    {
      title: "Total Funds Needed",
      value: "৳1.84M",
      sub: "Across all active requests",
      icon: DollarSign,
    },
    {
      title: "Funds Raised",
      value: "৳417k",
      sub: "22% of total goal",
      icon: TrendingUp,
    },
    {
      title: "Active Campaigns",
      value: "12",
      sub: "Running now",
      icon: HandCoins,
    },
    {
      title: "Pending Approval",
      value: "5",
      sub: "Requires verification",
      icon: AlertCircle,
    },
  ];

  return (
    <div className="space-y-8 p-1">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <SplitText
            text="Financial Requests"
            className="font-display text-4xl font-bold tracking-tight"
            delay={0.1}
          />
          <p className="text-muted-foreground animate-fade-in [animation-delay:400ms]">
            Manage fundraising campaigns, verify documents, and track donations.
          </p>
        </div>
        <Button className="font-semibold shadow-lg shadow-primary/20 animate-fade-in [animation-delay:500ms]">
          <HandCoins className="mr-2 h-4 w-4" />
          Create Verified Request
        </Button>
      </div>

      {/* Metrics Grid using SpotlightCard */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-fade-in [animation-delay:600ms]">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <SpotlightCard
              key={i}
              className="glass-card border-border/50 p-6"
              spotlightColor="rgba(220, 38, 38, 0.15)"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                {i === 1 && <Badge variant="secondary" className="text-success bg-success/10 border-success/20">+12%</Badge>}
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold font-display tracking-tight">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.title}</p>
              </div>
              <div className="mt-4 h-1 w-full rounded-full bg-secondary">
                <div 
                    className="h-full rounded-full bg-primary transition-all duration-1000 ease-out" 
                    style={{ width: `${(i + 2) * 15}%` }} 
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{stat.sub}</p>
            </SpotlightCard>
          );
        })}
      </div>

      {/* Main Content Area */}
      <Card className="glass-card border-border/50 overflow-hidden animate-slide-up [animation-delay:800ms]">
        <CardHeader className="border-b border-border/50 bg-secondary/5 px-6 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="font-display flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Campaign Management
            </CardTitle>
            
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns..."
                  className="w-[200px] bg-background/50 pl-9 transition-all focus:w-[250px]"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px] bg-background/50">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="fundraising">Fundraising</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" className="bg-background/50">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow className="hover:bg-transparent">
                <TableHead>Campaign Details</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Fundraising Progress</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((req) => {
                const progress = Math.round((req.amountRaised / req.amountNeeded) * 100);
                return (
                  <TableRow key={req.id} className="group transition-colors hover:bg-secondary/30">
                    <TableCell className="max-w-[300px]">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold font-display text-base group-hover:text-primary transition-colors">
                          {req.title}
                        </span>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="truncate">{req.patientName}</span>
                          <span>•</span>
                          <span className="text-xs border px-1.5 rounded">{req.id}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal bg-background/50 text-muted-foreground">
                        {req.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="w-[250px]">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold">৳{req.amountRaised.toLocaleString()}</span>
                          <span className="text-muted-foreground">of ৳{req.amountNeeded.toLocaleString()}</span>
                        </div>
                        <Progress value={progress} className={`h-2 ${getProgressColor(progress).replace("bg-", "text-")}`} />
                        <p className="text-xs text-muted-foreground text-right">{progress}% Funded</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(req.deadline).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`capitalize border ${getStatusColor(req.status)}`}
                      >
                        {req.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                          onClick={() => setSelectedRequest(req)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedRequest(req)}>
                              View Documents
                            </DropdownMenuItem>
                            <DropdownMenuItem>Edit Request</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {req.status === 'pending' && (
                                <>
                                    <DropdownMenuItem className="text-success">Approve Campaign</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">Reject Request</DropdownMenuItem>
                                </>
                            )}
                            {req.status !== 'pending' && (
                                <DropdownMenuItem className="text-destructive">Archive</DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Details Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl glass-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">{selectedRequest?.title}</DialogTitle>
            <DialogDescription>
                Request ID: {selectedRequest?.id} • Created on {selectedRequest?.createdAt}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground">Patient Name</h4>
                    <p className="font-semibold">{selectedRequest?.patientName}</p>
                </div>
                <div className="space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground">Hospital</h4>
                    <p className="font-semibold">{selectedRequest?.hospital}</p>
                </div>
                <div className="space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground">Amount Needed</h4>
                    <p className="font-semibold text-primary">৳{selectedRequest?.amountNeeded.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground">Urgency</h4>
                     <Badge variant="outline" className="capitalize">{selectedRequest?.urgency}</Badge>
                </div>
            </div>
            
            <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Story</h4>
                <div className="rounded-lg bg-secondary/30 p-4 text-sm">
                    {selectedRequest?.description}
                </div>
            </div>

            <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Attached Documents</h4>
                <div className="flex flex-wrap gap-2">
                    {selectedRequest?.documents.map((doc: string) => (
                        <div key={doc} className="flex items-center gap-2 rounded-md border border-border bg-background/50 px-3 py-2 text-sm">
                            <FileText className="h-4 w-4 text-primary" />
                            {doc}
                        </div>
                    ))}
                </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-border/50 pt-4">
            <Button variant="outline" onClick={() => setSelectedRequest(null)}>Close</Button>
            {selectedRequest?.status === "pending" && (
                <>
                    <Button variant="destructive">Reject</Button>
                    <Button className="bg-success hover:bg-success/90 text-white">Approve Campaign</Button>
                </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
