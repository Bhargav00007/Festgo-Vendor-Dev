"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Icon } from "@iconify/react";
import { ImSpinner8 } from "react-icons/im";
import CardBox from "../shared/CardBox";
import type { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const TotalVendors = () => {
  const [totalVendors, setTotalVendors] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const token = localStorage.getItem("vendorToken");
        if (!token) throw new Error("Token not found");

        const res = await fetch("https://server.festgo.in/api/admin/vendors", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.error("Failed to fetch vendors:", res.status);
          setTotalVendors(0);
        } else {
          const data = await res.json();
          setTotalVendors(Array.isArray(data) ? data.length : 0);
        }
      } catch (err) {
        console.error("Error fetching vendors:", err);
        setTotalVendors(0);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();

    // Detect screen size for responsive chart tweaks
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const ChartData: ApexOptions = {
    series: [
      {
        name: "Vendors",
        data: [totalVendors || 0, 52, 38, 47, 56],
      },
      {
        name: "Goal",
        data: [100, 100, 100, 100, 100],
      },
    ],
    chart: {
      fontFamily: "inherit",
      type: "bar",
      height: 80,
      stacked: true,
      toolbar: { show: false },
      sparkline: { enabled: true },
      animations: {
        enabled: true,
        speed: 1000,
        animateGradually: {
          enabled: true,
          delay: 150,
        },
        dynamicAnimation: {
          enabled: true,
          speed: 1000,
        },
      },
    },
    grid: { show: false },
    colors: ["#ff5c5c", "rgba(0,0,0,0.08)"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "45%",
        borderRadius: isMobile ? 8 : 4,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { show: false } },
    tooltip: { theme: "dark" },
    legend: { show: false },
  };

  return (
    <CardBox className="!shadow-none !p-3 !bg-[#f9dee8] !rounded-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-16 h-12 rounded-full flex items-center justify-center bg-red-500 text-white">
            <Icon icon="solar:users-group-rounded-bold-duotone" height={24} />
          </span>
          <div>
            <h5 className="lg:text-sm text-xl text-gray-600 font-medium">
              Total Vendors
            </h5>
            <p className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              {loading ? <ImSpinner8 className="animate-spin" /> : totalVendors}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-2">
        <span className="text-sm px-3 lg:mt-10 py-1 rounded-full lg:bg-white/60 text-gray-700 font-medium whitespace-nowrap">
          {loading ? "Loading.." : `${totalVendors} Vendors`}
        </span>

        <div className="w-full sm:w-40 lg:max-w-[120px] max-w-[200px]">
          <Chart
            options={ChartData}
            series={ChartData.series}
            type="bar"
            height={80}
            width="100%"
          />
        </div>
      </div>
    </CardBox>
  );
};

export default TotalVendors;
