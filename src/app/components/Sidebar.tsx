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

  const [toggled, setToggled] = useState(false); // mobile overlay mode
  const [collapsed, setCollapsed] = useState(false); // desktop collapse mode
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (pathname === "/login" || !isClient) return null;

  // Active link styling
  const getMenuItemClass = (path: string) => {
    return `hover:bg-blue-100 ${
      pathname === path ? "bg-blue-100 font-semibold" : ""
    }`;
  };

  const handleToggle = () => {
    if (isMobile) {
      setToggled((prev) => !prev); // mobile overlay toggle
    } else {
      setCollapsed((prev) => !prev); // desktop collapse toggle
    }
  };

  return (
    <div className="flex h-screen">
      {/* Top navbar with toggle button */}
      <div className="fixed top-0.5 -left-1 w-full flex items-center px-4 py-2 z-[11000] ">
        <button
          onClick={handleToggle}
          className="p-4 text-gray-800 hover:bg-blue-100 rounded-full  cursor-pointer"
        >
          <FaBars className="text-xl" />
        </button>
      </div>

      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        toggled={toggled}
        breakPoint="md"
        onBackdropClick={() => setToggled(false)}
        backgroundColor="#ffffff"
        rootStyles={{
          color: "#414141ff",
          borderRight: "none",
          position: "relative",
        }}
        className={isMobile ? "" : "pt-18.5 "}
      >
        <Menu>
          <div className="lg:pt-0 pt-14">
            <MenuItem
              icon={<IoBarChart />}
              className={getMenuItemClass("/crm")}
              onClick={() => router.push("/crm")}
            >
              Dashboard
            </MenuItem>
          </div>

          <MenuItem
            icon={<FaUserTie />}
            className={getMenuItemClass("/vendorlist")}
            onClick={() => router.push("/vendorlist")}
          >
            Vendors Management
          </MenuItem>
        </Menu>
      </Sidebar>
    </div>
  );
};

export default SidebarMenu;
