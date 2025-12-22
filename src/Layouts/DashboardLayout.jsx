import React from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function DashboardLayout({ children, breadcrumbs }) {
  const { t } = useTranslation();

  // breadcrumbs: array of items. Each item can be { type: 'link'|'page'|'separator', text, href }
  const defaultBreadcrumbs = [
    { type: 'link', text: t('app.home'), href: '/' },
    { type: 'separator' },
    { type: 'page', text: t('app.dashboard') },
  ];

  const items = Array.isArray(breadcrumbs) && breadcrumbs.length ? breadcrumbs : defaultBreadcrumbs;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex w-full items-center justify-between gap-2 px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  {(() => {
                    const nodes = [];

                    items.forEach((item, idx) => {
                      // explicit separator entry - render as-is
                      if (item.type === 'separator') {
                        nodes.push(
                          <BreadcrumbSeparator
                            key={`sep-${idx}`}
                            className={item.className ?? 'hidden md:block'}
                          />
                        );
                        return;
                      }

                      // breadcrumb item (link)
                      if (item.type === 'link') {
                        nodes.push(
                          <BreadcrumbItem
                            key={`item-${idx}`}
                            className={item.className ?? 'hidden md:block'}
                          >
                            <Link to={item.href ?? '#'} className="hover:underline">
                              {item.text}
                            </Link>
                          </BreadcrumbItem>
                        );
                      } else {
                        // default to page
                        nodes.push(
                          <BreadcrumbItem key={`item-${idx}`} className={item.className ?? ''}>
                            <BreadcrumbPage>{item.text}</BreadcrumbPage>
                          </BreadcrumbItem>
                        );
                      }

                      // insert an automatic separator between items unless the next item is an explicit separator
                      const next = items[idx + 1];
                      if (idx < items.length - 1 && !(next && next.type === 'separator')) {
                        nodes.push(
                          <BreadcrumbSeparator
                            key={`auto-sep-${idx}`}
                            className={item.separatorClassName ?? 'hidden md:block'}
                          />
                        );
                      }
                    });

                    return nodes;
                  })()}
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <div className="flex items-center justify-end gap-1">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}