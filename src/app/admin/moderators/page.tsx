'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
  Plus,
  Shield,
  UserPlus,
  Edit,
  Key,
  Clock,
  Activity,
} from "lucide-react";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import CountUp from "@/components/reactbits/CountUp";

// Mock moderator data
const moderators = [
  {
    id: 1,
    name: "Rashid Ahmed",
    email: "rashid@bloodreq.com",
    role: "Manager",
    countries: ["Bangladesh", "India"],
    permissions: ["approve_blood", "approve_financial", "manage_users", "view_reports"],
    status: "active",
    lastActive: "2026-01-11T14:30:00",
  },
  {
    id: 2,
    name: "Priya Patel",
    email: "priya@bloodreq.com",
    role: "Moderator",
    countries: ["India"],
    permissions: ["approve_blood", "view_reports"],
    status: "active",
    lastActive: "2026-01-11T10:15:00",
  },
  {
    id: 3,
    name: "Ali Khan",
    email: "ali@bloodreq.com",
    role: "Moderator",
    countries: ["Pakistan"],
    permissions: ["approve_blood", "approve_financial"],
    status: "suspended",
    lastActive: "2026-01-09T09:30:00",
  },
];

const auditLogs = [
  { id: 1, moderator: "Rashid Ahmed", action: "Approved blood request", entity: "BR-001", timestamp: "2026-01-11T14:30:00", ip: "103.45.67.89" },
  { id: 2, moderator: "Priya Patel", action: "Banned user", entity: "USER-234", timestamp: "2026-01-11T10:15:00", ip: "182.78.90.12" },
  { id: 3, moderator: "Rashid Ahmed", action: "Approved financial request", entity: "FR-012", timestamp: "2026-01-10T16:45:00", ip: "103.45.67.89" },
  { id: 4, moderator: "Ali Khan", action: "Rejected blood request", entity: "BR-045", timestamp: "2026-01-09T09:30:00", ip: "110.23.45.67" },
];

const permissionLabels: Record<string, string> = {
  approve_blood: "Blood Requests",
  approve_financial: "Financial Requests",
  manage_users: "User Management",
  view_reports: "View Reports",
  manage_ads: "Manage Ads",
  edit_translations: "Edit Translations",
  manage_moderators: "Manage Moderators",
};

export default function ModeratorsPage() {
  const [activeTab, setActiveTab] = useState<'moderators' | 'audit'>('moderators');

  const stats = [
    { label: "Active Moderators", value: moderators.filter(m => m.status === 'active').length, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Total Moderators", value: moderators.length, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Actions Today", value: 47, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">Moderators</h1>
          <p className="text-muted-foreground mt-1">
            Manage team members and permissions
          </p>
        </div>
        <Button className="bg-primary hover:bg-red-600">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Moderator
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
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
          variant={activeTab === 'moderators' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('moderators')}
          className={activeTab === 'moderators' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
        >
          <Shield className="w-4 h-4 mr-2" />
          Moderators
        </Button>
        <Button
          variant={activeTab === 'audit' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('audit')}
          className={activeTab === 'audit' ? 'bg-purple-500 hover:bg-purple-600' : ''}
        >
          <Clock className="w-4 h-4 mr-2" />
          Audit Log
        </Button>
      </div>

      {/* Search */}
      <Card className="glass-card border-border/50">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={activeTab === 'moderators' ? "Search moderators..." : "Search audit logs..."}
              className="bg-secondary/50 pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {activeTab === 'moderators' ? (
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="font-display">Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Countries</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {moderators.map((mod) => (
                  <TableRow key={mod.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{mod.name}</p>
                        <p className="text-xs text-muted-foreground">{mod.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={mod.role === 'Manager' ? 'border-amber-500/50 text-amber-500' : ''}>
                        {mod.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {mod.countries.map((c) => (
                          <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {mod.permissions.slice(0, 2).map((p) => (
                          <Badge key={p} variant="outline" className="text-xs">{permissionLabels[p]}</Badge>
                        ))}
                        {mod.permissions.length > 2 && (
                          <Badge variant="outline" className="text-xs">+{mod.permissions.length - 2}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={mod.status === 'active' ? 'bg-success/10 text-success border-success/30' : 'bg-warning/10 text-warning border-warning/30'}>
                        {mod.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(mod.lastActive).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                          <DropdownMenuItem><Key className="mr-2 h-4 w-4" />Reset Password</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">Suspend</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="font-display">Audit Log</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Moderator</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium">{log.moderator}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">{log.entity}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{log.ip}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
