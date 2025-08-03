"use client";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import {
  FaChartPie,
  FaChartLine,
  FaCalendarAlt,
  FaBook,
  FaBars,
} from "react-icons/fa";

const SidebarMenu = () => {
  const pathname = usePathname();

  const [toggled, setToggled] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  if (pathname === "/login") return null;
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

      {/* Toggle button only visible when sidebar is hidden */}
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
