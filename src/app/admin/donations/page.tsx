'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Search,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Eye,
  Heart,
  Wallet,
  Clock,
  ImageIcon,
  Activity,
} from "lucide-react";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import CountUp from "@/components/reactbits/CountUp";

// Mock donation data
const donations = [
  {
    id: "DON-001",
    type: "blood",
    donorName: "Mohammad Rahim",
    donorPhone: "+880 1712-345678",
    requestId: "BR-001",
    patientName: "Abdul Karim",
    bloodGroup: "A+",
    units: 1,
    status: "verified",
    date: "2026-01-11T14:30:00",
  },
  {
    id: "DON-002",
    type: "financial",
    donorName: "Sarah Khan",
    donorPhone: "+880 1811-223344",
    requestId: "FR-003",
    amount: 5000,
    currency: "BDT",
    paymentMethod: "bKash",
    transactionId: "TXN123456",
    status: "pending",
    date: "2026-01-11T10:15:00",
    hasScreenshot: true,
  },
  {
    id: "DON-003",
    type: "blood",
    donorName: "Fatima Begum",
    donorPhone: "+880 1911-556677",
    requestId: "BR-005",
    patientName: "Nasreen Akhtar",
    bloodGroup: "O+",
    units: 2,
    status: "pending",
    date: "2026-01-10T16:45:00",
  },
  {
    id: "DON-004",
    type: "financial",
    donorName: "Ahmed Hossain",
    donorPhone: "+91 98765-43210",
    requestId: "FR-001",
    amount: 10000,
    currency: "INR",
    paymentMethod: "GPay",
    transactionId: "GPY789012",
    status: "verified",
    date: "2026-01-09T09:30:00",
    hasScreenshot: false,
  },
  {
    id: "DON-005",
    type: "financial",
    donorName: "Priya Sharma",
    donorPhone: "+91 99887-76655",
    requestId: "FR-002",
    amount: 2500,
    currency: "INR",
    paymentMethod: "Stripe",
    transactionId: "STR456789",
    status: "failed",
    date: "2026-01-08T12:00:00",
    hasScreenshot: false,
  },
];

const getStatusStyles = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-warning/10 text-warning border-warning/30";
    case "verified":
      return "bg-success/10 text-success border-success/30";
    case "failed":
      return "bg-destructive/10 text-destructive border-destructive/30";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export default function DonationsPage() {
  const [activeTab, setActiveTab] = useState<'blood' | 'financial'>('blood');

  const bloodDonations = donations.filter(d => d.type === 'blood');
  const financialDonations = donations.filter(d => d.type === 'financial');
  const currentDonations = activeTab === 'blood' ? bloodDonations : financialDonations;

  const stats = [
    { label: "Pending Verification", value: donations.filter(d => d.status === 'pending').length, color: "text-warning", bg: "bg-warning/10" },
    { label: "Verified Today", value: 23, color: "text-success", bg: "bg-success/10" },
    { label: "Blood Donations", value: bloodDonations.length, color: "text-red-500", bg: "bg-red-500/10" },
    { label: "Financial Donations", value: financialDonations.length, color: "text-blue-500", bg: "bg-blue-500/10" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">Donations</h1>
          <p className="text-muted-foreground mt-1">
            Manage and verify blood & financial donations
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                <Activity className="h-5 w-5" />
              </div>
            </div>
          </SpotlightCard>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/50 pb-4">
        <Button
          variant={activeTab === 'blood' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('blood')}
          className={activeTab === 'blood' ? 'bg-red-500 hover:bg-red-600' : ''}
        >
          <Heart className="w-4 h-4 mr-2" />
          Blood Donations
        </Button>
        <Button
          variant={activeTab === 'financial' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('financial')}
          className={activeTab === 'financial' ? 'bg-blue-500 hover:bg-blue-600' : ''}
        >
          <Wallet className="w-4 h-4 mr-2" />
          Financial Donations
        </Button>
      </div>

      {/* Filters */}
      <Card className="glass-card border-border/50">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by donor name, ID, or transaction..."
                className="bg-secondary/50 pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select>
                <SelectTrigger className="w-[130px] bg-secondary/50">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              {activeTab === 'financial' && (
                <Select>
                  <SelectTrigger className="w-[140px] bg-secondary/50">
                    <SelectValue placeholder="Payment Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="bkash">bKash</SelectItem>
                    <SelectItem value="nagad">Nagad</SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Donations Table */}
      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="font-display">
            {activeTab === 'blood' ? 'Blood Donations' : 'Financial Donations'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Donation ID</TableHead>
                <TableHead>Donor</TableHead>
                {activeTab === 'blood' ? (
                  <>
                    <TableHead>Patient</TableHead>
                    <TableHead>Blood Group</TableHead>
                    <TableHead>Units</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Transaction ID</TableHead>
                  </>
                )}
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentDonations.map((donation) => (
                <TableRow key={donation.id}>
                  <TableCell className="font-medium">{donation.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{donation.donorName}</p>
                      <p className="text-xs text-muted-foreground">{donation.donorPhone}</p>
                    </div>
                  </TableCell>
                  {activeTab === 'blood' ? (
                    <>
                      <TableCell>{(donation as any).patientName}</TableCell>
                      <TableCell>
                        <Badge className="bg-red-500 text-white">{(donation as any).bloodGroup}</Badge>
                      </TableCell>
                      <TableCell>{(donation as any).units}</TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="font-semibold">
                        {(donation as any).currency} {(donation as any).amount?.toLocaleString()}
                      </TableCell>
                      <TableCell>{(donation as any).paymentMethod}</TableCell>
                      <TableCell className="font-mono text-xs">{(donation as any).transactionId}</TableCell>
                    </>
                  )}
                  <TableCell>
                    <Badge variant="outline" className={`capitalize ${getStatusStyles(donation.status)}`}>
                      {donation.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs">
                        {new Date(donation.date).toLocaleDateString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {donation.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-success hover:text-success hover:bg-success/10"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {activeTab === 'financial' && (donation as any).hasScreenshot && (
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>View Request</DropdownMenuItem>
                          <DropdownMenuItem>Contact Donor</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            Mark as Fraudulent
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              Showing 1-{currentDonations.length} of {currentDonations.length} donations
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
