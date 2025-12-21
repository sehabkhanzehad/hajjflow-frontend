import * as React from "react"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation();

  const displayUser = {
    name: user.attributes.name,
    email: user.attributes.email,
    avatar: "",
  };

  const navMain = [
    {
      title: t('app.dashboard'),
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        {
          title: t('app.overview'),
          url: "/dashboard",
        },
        {
          title: t('app.analytics'),
          url: "/dashboard/analytics",
        },
        {
          title: t('app.reports'),
          url: "/dashboard/reports",
        },
      ],
    },
    {
      title: t('app.accounts'),
      url: "/accounts",
      icon: Wallet,
      items: [
        {
          title: t('app.allAccounts'),
          url: "/accounts",
        },
        {
          title: t('app.transactions'),
          url: "/accounts/transactions",
        },
        {
          title: t('app.reconciliation'),
          url: "/accounts/reconciliation",
        },
      ],
    },
    {
      title: t('app.invoices'),
      url: "/invoices",
      icon: Receipt,
      items: [
        {
          title: t('app.allInvoices'),
          url: "/invoices",
        },
        {
          title: t('app.createInvoice'),
          url: "/invoices/create",
        },
        {
          title: t('app.drafts'),
          url: "/invoices/drafts",
        },
      ],
    },
    {
      title: t('app.payments'),
      url: "/payments",
      icon: CreditCard,
      items: [
        {
          title: t('app.allPayments'),
          url: "/payments",
        },
        {
          title: t('app.pending'),
          url: "/payments/pending",
        },
        {
          title: t('app.history'),
          url: "/payments/history",
        },
      ],
    },
    {
      title: t('app.settings'),
      url: "/settings",
      icon: Settings2,
      items: [
        {
          title: t('app.general'),
          url: "/settings",
        },
        {
          title: t('app.team'),
          url: "/settings/team",
        },
        {
          title: t('app.billing'),
          url: "/settings/billing",
        },
        {
          title: t('app.integrations'),
          url: "/settings/integrations",
        },
      ],
    },
  ];

  const projects = [
    {
      name: t('app.companyAccounts'),
      url: "/projects/company",
      icon: Frame,
    },
    {
      name: t('app.taxPlanning'),
      url: "/projects/tax",
      icon: PieChart,
    },
    {
      name: t('app.budget2025'),
      url: "/projects/budget",
      icon: Map,
    },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavProjects projects={projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={displayUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
