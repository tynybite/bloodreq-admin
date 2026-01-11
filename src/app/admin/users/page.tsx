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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Filter,
  MoreHorizontal,
  UserPlus,
  Download,
  Ban,
  Mail,
  Eye,
} from "lucide-react";

// Mock user data
const users = [
  {
    id: "USR-001",
    name: "Mohammad Hasan",
    email: "hasan@example.com",
    mobile: "+880 1712-345678",
    bloodGroup: "A+",
    role: "donor",
    country: "Bangladesh",
    city: "Dhaka",
    donations: 12,
    status: "active",
    joinedAt: "2024-08-15",
    avatar: null,
  },
  {
    id: "USR-002",
    name: "Fatima Rahman",
    email: "fatima@example.com",
    mobile: "+880 1898-765432",
    bloodGroup: "O-",
    role: "requester",
    country: "Bangladesh",
    city: "Chittagong",
    donations: 0,
    status: "active",
    joinedAt: "2024-09-22",
    avatar: null,
  },
  {
    id: "USR-003",
    name: "Rajesh Kumar",
    email: "rajesh@example.com",
    mobile: "+91 98765-43210",
    bloodGroup: "B+",
    role: "donor",
    country: "India",
    city: "Kolkata",
    donations: 8,
    status: "active",
    joinedAt: "2024-06-10",
    avatar: null,
  },
  {
    id: "USR-004",
    name: "Ayesha Khan",
    email: "ayesha@example.com",
    mobile: "+92 300-1234567",
    bloodGroup: "AB+",
    role: "both",
    country: "Pakistan",
    city: "Karachi",
    donations: 5,
    status: "suspended",
    joinedAt: "2024-07-03",
    avatar: null,
  },
  {
    id: "USR-005",
    name: "Karim Ahmed",
    email: "karim@example.com",
    mobile: "+880 1911-223344",
    bloodGroup: "O+",
    role: "donor",
    country: "Bangladesh",
    city: "Sylhet",
    donations: 23,
    status: "active",
    joinedAt: "2023-12-01",
    avatar: null,
  },
];

const getStatusVariant = (status: string) => {
  switch (status) {
    case "active":
      return "default";
    case "suspended":
      return "destructive";
    case "banned":
      return "outline";
    default:
      return "secondary";
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case "donor":
      return "bg-success/10 text-success";
    case "requester":
      return "bg-warning/10 text-warning";
    case "both":
      return "bg-primary/10 text-primary";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export default function UsersPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">
            Manage all registered users on the platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" className="gradient-blood text-white">
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="glass-card border-border/50">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, mobile, or ID..."
                className="bg-secondary/50 pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select>
                <SelectTrigger className="w-[140px] bg-secondary/50">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="donor">Donor</SelectItem>
                  <SelectItem value="requester">Requester</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-[140px] bg-secondary/50">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-[140px] bg-secondary/50">
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  <SelectItem value="bangladesh">Bangladesh</SelectItem>
                  <SelectItem value="india">India</SelectItem>
                  <SelectItem value="pakistan">Pakistan</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="font-display">All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Blood Group</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-center">Donations</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatar || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="border-primary/30 bg-primary/10 text-primary font-bold"
                    >
                      {user.bloodGroup}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{user.city}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.country}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-semibold">{user.donations}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(user.status)}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(user.joinedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Message
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Ban className="mr-2 h-4 w-4" />
                          Ban User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              Showing 1-5 of 24,823 users
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
