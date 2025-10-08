"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { FaBars } from "react-icons/fa";
import { VscGraph } from "react-icons/vsc";
import { MdOutlineBeachAccess } from "react-icons/md";
import { LuUsersRound } from "react-icons/lu";
import { LuPartyPopper } from "react-icons/lu";
import { LiaCookieBiteSolid } from "react-icons/lia";
import { PiFlagBannerFold } from "react-icons/pi";

import { LuBuilding2 } from "react-icons/lu";
import { TbBus } from "react-icons/tb";

const SidebarMenu = () => {
  const pathname = usePathname();

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
    if (pathname === path) {
      return "bg-blue-100 font-semibold  "; // Active style
    }
    return "hover:bg-[#dbeafe] "; // Hover style for non-active
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
      <div>
        <button
          onClick={handleToggle}
          className="p-2 text-gray-800 hover:bg-blue-100  cursor-pointer fixed top-4.5 left-5 flex items-center z-[500]"
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
        backgroundColor="#f7f7f7"
        rootStyles={{
          color: "#414141ff",
          borderRight: "none",
          position: "relative",
        }}
        className={isMobile ? "" : "pt-18.5"}
      >
        <Menu
          menuItemStyles={{
            button: {
              "&:hover": {
                backgroundColor: "#dbeafe",
                color: "#1e40af",
              },
            },
          }}
        >
          <div className="lg:pt-0 pt-14">
            <MenuItem
              icon={<VscGraph size={22} />}
              className={getMenuItemClass("/crm")}
              component={<Link href="/crm" />}
            >
              Dashboard
            </MenuItem>
          </div>

          <MenuItem
            icon={
              <MdOutlineBeachAccess
                size={22}
                style={{ transform: "scaleX(-1)" }}
              />
            }
            className={getMenuItemClass("/fests/list")}
            component={<Link href="/fests/list" />}
          >
            Beach Fest
          </MenuItem>

          <MenuItem
            icon={<TbBus size={22} />}
            className={getMenuItemClass("/festgotrips")}
            component={<Link href="/festgotrips" />}
          >
            Trips{" "}
          </MenuItem>

          <MenuItem
            icon={<LuBuilding2 size={22} />}
            className={getMenuItemClass("/cityfest/categories")}
            component={<Link href="/cityfest/categories" />}
          >
            City Fest{" "}
          </MenuItem>

          <MenuItem
            icon={<LuPartyPopper size={22} />}
            className={getMenuItemClass("/events")}
            component={<Link href="/events" />}
          >
            Events{" "}
          </MenuItem>

          <MenuItem
            icon={<LiaCookieBiteSolid size={22} />}
            className={getMenuItemClass("/festbite")}
            component={<Link href="/festbite" />}
          >
            FestBite{" "}
          </MenuItem>

          <MenuItem
            icon={<PiFlagBannerFold size={22} />}
            className={getMenuItemClass("adminbanner")}
            component={<Link href="/adminbanner" />}
          >
            Admin Banner
          </MenuItem>

          <MenuItem
            icon={<LuUsersRound size={22} />}
            className={getMenuItemClass("/vendorlist")}
            component={<Link href="/vendorlist" />}
          >
            Vendors Management
          </MenuItem>
        </Menu>
      </Sidebar>
    </div>
  );
};

export default SidebarMenu;
