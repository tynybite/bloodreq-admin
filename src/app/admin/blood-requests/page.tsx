import Link from "next/link";
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
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import CountUp from "@/components/reactbits/CountUp";
import {
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Eye,
  MapPin,
  Clock,
  AlertTriangle,
  Activity,
} from "lucide-react";

// Mock blood request data
const bloodRequests = [
  {
    id: "BR-001",
    patientName: "Abdul Karim",
    bloodGroup: "A+",
    units: 2,
    hospital: "Dhaka Medical College",
    city: "Dhaka",
    country: "Bangladesh",
    urgency: "critical",
    status: "pending",
    requesterName: "Fatima Begum",
    requesterPhone: "+880 1712-345678",
    createdAt: "2026-01-11T14:30:00",
    donorsAccepted: 0,
  },
  {
    id: "BR-002",
    patientName: "Razia Sultana",
    bloodGroup: "O-",
    units: 3,
    hospital: "Apollo Hospital",
    city: "Kolkata",
    country: "India",
    urgency: "urgent",
    status: "approved",
    requesterName: "Kamal Hossain",
    requesterPhone: "+91 98765-43210",
    createdAt: "2026-01-11T10:15:00",
    donorsAccepted: 1,
  },
  {
    id: "BR-003",
    patientName: "Mohammad Ali",
    bloodGroup: "B+",
    units: 1,
    hospital: "Square Hospital",
    city: "Dhaka",
    country: "Bangladesh",
    urgency: "planned",
    status: "approved",
    requesterName: "Sarah Khan",
    requesterPhone: "+880 1811-223344",
    createdAt: "2026-01-10T16:45:00",
    donorsAccepted: 2,
  },
  {
    id: "BR-004",
    patientName: "Priya Sharma",
    bloodGroup: "AB-",
    units: 2,
    hospital: "AIIMS Delhi",
    city: "Delhi",
    country: "India",
    urgency: "critical",
    status: "pending",
    requesterName: "Rahul Sharma",
    requesterPhone: "+91 99887-76655",
    createdAt: "2026-01-11T12:00:00",
    donorsAccepted: 0,
  },
  {
    id: "BR-005",
    patientName: "Nasreen Akhtar",
    bloodGroup: "O+",
    units: 4,
    hospital: "Aga Khan Hospital",
    city: "Karachi",
    country: "Pakistan",
    urgency: "urgent",
    status: "completed",
    requesterName: "Ahmed Khan",
    requesterPhone: "+92 300-1234567",
    createdAt: "2026-01-09T09:30:00",
    donorsAccepted: 4,
  },
];

const getUrgencyVariant = (urgency: string) => {
  switch (urgency) {
    case "critical":
      return "destructive";
    case "urgent":
      return "default";
    case "planned":
      return "secondary";
    default:
      return "outline";
  }
};

const getStatusStyles = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-warning/10 text-warning border-warning/30";
    case "approved":
      return "bg-success/10 text-success border-success/30";
    case "completed":
      return "bg-primary/10 text-primary border-primary/30";
    case "rejected":
      return "bg-destructive/10 text-destructive border-destructive/30";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getBloodGroupColor = (group: string) => {
  if (group.includes("-")) {
    return "bg-chart-4 text-white"; // Rare blood types
  }
  return "bg-primary text-white";
};

export default function BloodRequestsPage() {
  const pendingCount = bloodRequests.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Blood Requests</h1>
          <p className="text-muted-foreground">
            Review and manage blood donation requests
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-warning/10 px-4 py-2 text-warning">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">{pendingCount} pending approval</span>
          </div>
        )}
        <Button asChild className="btn-primary">
            <Link href="/admin/blood-requests/new">
                Create Request
            </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Pending", value: 12, color: "text-warning", bg: "bg-warning/10" },
          { label: "Approved", value: 45, color: "text-success", bg: "bg-success/10" },
          { label: "In Progress", value: 23, color: "text-primary", bg: "bg-primary/10" },
          { label: "Completed", value: 1204, color: "text-muted-foreground", bg: "bg-secondary" },
        ].map((stat) => (
          <SpotlightCard key={stat.label} className="p-6 border-border/50 bg-card/50 backdrop-blur-md dark:bg-zinc-900/50" spotlightColor="rgba(220, 38, 38, 0.1)">
             <div className="flex justify-between items-start mb-4">
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

      {/* Filters */}
      <Card className="glass-card border-border/50">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by patient, hospital, or request ID..."
                className="bg-secondary/50 pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select>
                <SelectTrigger className="w-[130px] bg-secondary/50">
                  <SelectValue placeholder="Blood Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-[120px] bg-secondary/50">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-[120px] bg-secondary/50">
                  <SelectValue placeholder="Urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="planned">Planned</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blood Requests Table */}
      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="font-display">All Blood Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Blood</TableHead>
                <TableHead>Hospital</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Donors</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bloodRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{request.patientName}</p>
                      <p className="text-xs text-muted-foreground">
                        {request.id}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge className={getBloodGroupColor(request.bloodGroup)}>
                        {request.bloodGroup}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        ×{request.units}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm">{request.hospital}</p>
                        <p className="text-xs text-muted-foreground">
                          {request.city}, {request.country}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getUrgencyVariant(request.urgency)}
                      className="capitalize"
                    >
                      {request.urgency}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`capitalize ${getStatusStyles(request.status)}`}
                    >
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-semibold">{request.donorsAccepted}</span>
                    <span className="text-muted-foreground">/{request.units}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {request.status === "pending" && (
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
                          <DropdownMenuItem>Edit Request</DropdownMenuItem>
                          <DropdownMenuItem>View Donors</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            Delete Request
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
              Showing 1-5 of 1,284 requests
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
