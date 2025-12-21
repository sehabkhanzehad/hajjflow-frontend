import * as React from "react"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  LayoutDashboard,
  Users,
  Receipt,
  CreditCard,
  Wallet,
} from "lucide-react"

import { NavMain } from '@/components/nav-main'
import { NavProjects } from '@/components/nav-projects'
import { NavUser } from '@/components/nav-user'
import { TeamSwitcher } from '@/components/team-switcher'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'

// This is sample data.
const data = {
  teams: [
    {
      name: "Accounts Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Finance Corp.",
      logo: AudioWaveform,
      plan: "Business",
    },
    {
      name: "Trading Ltd.",
      logo: Command,
      plan: "Pro",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "/dashboard",
        },
        {
          title: "Analytics",
          url: "/dashboard/analytics",
        },
        {
          title: "Reports",
          url: "/dashboard/reports",
        },
      ],
    },
    {
      title: "Accounts",
      url: "/accounts",
      icon: Wallet,
      items: [
        {
          title: "All Accounts",
          url: "/accounts",
        },
        {
          title: "Transactions",
          url: "/accounts/transactions",
        },
        {
          title: "Reconciliation",
          url: "/accounts/reconciliation",
        },
      ],
    },
    {
      title: "Invoices",
      url: "/invoices",
      icon: Receipt,
      items: [
        {
          title: "All Invoices",
          url: "/invoices",
        },
        {
          title: "Create Invoice",
          url: "/invoices/create",
        },
        {
          title: "Drafts",
          url: "/invoices/drafts",
        },
      ],
    },
    {
      title: "Payments",
      url: "/payments",
      icon: CreditCard,
      items: [
        {
          title: "All Payments",
          url: "/payments",
        },
        {
          title: "Pending",
          url: "/payments/pending",
        },
        {
          title: "History",
          url: "/payments/history",
        },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "/settings",
        },
        {
          title: "Team",
          url: "/settings/team",
        },
        {
          title: "Billing",
          url: "/settings/billing",
        },
        {
          title: "Integrations",
          url: "/settings/integrations",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Company Accounts",
      url: "/projects/company",
      icon: Frame,
    },
    {
      name: "Tax Planning",
      url: "/projects/tax",
      icon: PieChart,
    },
    {
      name: "Budget 2025",
      url: "/projects/budget",
      icon: Map,
    },
  ],
}

export function AppSidebar({
  ...props
}) {
  const { user } = useAuth();

  const displayUser = {
    name: user.attributes.name,
    email: user.attributes.email,
    avatar: "",
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={displayUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
