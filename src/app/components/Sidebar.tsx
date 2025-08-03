"use client";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import {
  FaChartPie,
  FaChartLine,
  FaCalendarAlt,
  FaBook,
  FaBars,
  FaUserTie,
} from "react-icons/fa";
import { IoBarChart } from "react-icons/io5";

const SidebarMenu = () => {
  const pathname = usePathname();
  const router = useRouter();

  const [toggled, setToggled] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (pathname === "/login" || !isClient) return null;

  // Function to apply active style
  const getMenuItemClass = (path: string) => {
    return `hover:bg-blue-100  ${
      pathname === path ? "bg-blue-100  font-semibold" : ""
    }`;
  };

  return (
    <div className="h-screen flex sticky top-0 z-[9999]">
      <Sidebar
        collapsed={collapsed}
        toggled={toggled}
        breakPoint="md"
        onBackdropClick={() => setToggled(false)}
        backgroundColor="#ffffff"
        rootStyles={{
          color: "#414141ff",
          borderRight: "1px solid #e5e7eb",
        }}
      >
        <Menu>
          <MenuItem
            icon={<FaBars />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ marginBottom: "0px", color: "#374151" }}
            className="hover:bg-blue-100 rounded-full"
          >
            {!collapsed && "Toggle"}
          </MenuItem>

          {/* CRM menu item */}
          <MenuItem
            icon={<IoBarChart />}
            className={getMenuItemClass("/crm")}
            onClick={() => router.push("/crm")}
          >
            CRM
          </MenuItem>

          {/* Vendors menu item */}
          <MenuItem
            icon={<FaUserTie />}
            className={getMenuItemClass("/vendorlist")}
            onClick={() => router.push("/vendorlist")}
          >
            Vendors
          </MenuItem>

          <SubMenu label="Charts" icon={<FaChartPie />} defaultOpen>
            <MenuItem
              icon={<FaChartPie />}
              className="hover:bg-blue-100 rounded-full"
            >
              Pie Charts
            </MenuItem>
            <MenuItem
              icon={<FaChartLine />}
              className="hover:bg-blue-100 rounded-full"
            >
              Line Charts
            </MenuItem>
          </SubMenu>

          <MenuItem
            icon={<FaBook />}
            className="hover:bg-blue-100 rounded-full"
          >
            Documentation
          </MenuItem>
          <MenuItem
            icon={<FaCalendarAlt />}
            className="hover:bg-blue-100 rounded-full"
          >
            Calendar
          </MenuItem>
        </Menu>
      </Sidebar>

      {!toggled && (
        <button
          className="md:hidden p-2 text-gray-800 absolute -top-12.5 left-4 z-[10000] "
          onClick={() => setToggled(true)}
        >
          <FaBars />
        </button>
      )}
    </div>
  );
};

export default SidebarMenu;
