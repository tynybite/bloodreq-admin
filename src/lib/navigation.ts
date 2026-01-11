// Navigation items for the admin sidebar
import {
  LayoutDashboard,
  Users,
  Droplets,
  HandCoins,
  Wallet,
  Shield,
  MapPin,
  Languages,
  Megaphone,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  children?: NavItem[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        title: "Users",
        href: "/admin/users",
        icon: Users,
      },
      {
        title: "Blood Requests",
        href: "/admin/blood-requests",
        icon: Droplets,
        badge: 12, // Example pending count
      },
      {
        title: "Financial Requests",
        href: "/admin/financial-requests",
        icon: HandCoins,
        badge: 5,
      },
      {
        title: "Donations",
        href: "/admin/donations",
        icon: Wallet,
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        title: "Moderators",
        href: "/admin/moderators",
        icon: Shield,
      },
      {
        title: "Locations",
        href: "/admin/locations",
        icon: MapPin,
      },
      {
        title: "Translations",
        href: "/admin/translations",
        icon: Languages,
      },
      {
        title: "Advertisements",
        href: "/admin/ads",
        icon: Megaphone,
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        title: "Settings",
        href: "/admin/settings",
        icon: Settings,
      },
    ],
  },
];
