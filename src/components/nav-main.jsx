"use client"

import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'

export function NavMain({ items, section }) {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{section}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const hasChildren = item.items && item.items.length > 0;

          // Check if any subItem is active or if current path starts with parent URL or any subItem URL
          const isSubActive = item.items?.some((subItem) => subItem.url === currentPath || currentPath.startsWith(subItem.url + '/')) || currentPath.startsWith(item.url + '/');

          if (hasChildren) {
            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={isSubActive} // Expand parent if any child is active
                className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title} className="flex items-center">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          {item.icon && <item.icon className="w-4 h-4" />}
                          <span>{item.title}</span>
                        </div>
                        <div className={`w-6 flex items-center justify-end gap-1 ${item.new ? 'w-12' : ''}`}>
                          {item.new && (
                            <span className="px-1 py-0.5 text-[10px] font-semibold bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-sm shadow-sm">
                              NEW
                            </span>
                          )}
                          <ChevronRight
                            className="w-4 h-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </div>
                      </div>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => {
                        const isSubItemActive = subItem.url === currentPath || currentPath.startsWith(subItem.url + '/');
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild isActive={isSubItemActive}>
                              <Link to={subItem.url} className="flex items-center justify-between w-full">
                                <span>{subItem.title}</span>
                                {subItem.new && (
                                  <span className="ml-2 px-1 py-0.5 text-[10px] font-semibold bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-sm shadow-sm">
                                    NEW
                                  </span>
                                )}
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          }

          const isActive = item.url === currentPath || currentPath.startsWith(item.url + '/');

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton tooltip={item.title} asChild isActive={isActive} className="flex items-center">
                <Link to={item.url}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      {item.icon && <item.icon className="w-4 h-4 shrink-0" />}
                      <span>{item.title}</span>
                    </div>
                    <div className="w-6 flex items-center justify-end">
                      {item.new && (
                        <span className="px-1 py-0.5 text-[10px] font-semibold bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-sm shadow-sm">
                          NEW
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
