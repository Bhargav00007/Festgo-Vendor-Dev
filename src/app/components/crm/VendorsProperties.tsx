"use client";
import React, { useEffect, useState } from "react";
import CardBox from "../shared/CardBox";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { Icon } from "@iconify/react";
import { ImSpinner8 } from "react-icons/im";

// ✅ Define a proper type for vendors
type Vendor = {
  id: string;
};

const VendorsProperties = () => {
  const [totalVendors, setTotalVendors] = useState(0);
  const [vendorsWithProperties, setVendorsWithProperties] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("vendorToken");
        if (!token) throw new Error("Token not found");

        const vendorsRes = await fetch(
          "https://server.festgo.in/api/admin/vendors",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!vendorsRes.ok) throw new Error("Failed to fetch vendors");

        const vendorsData = await vendorsRes.json();
        const vendors: Vendor[] = vendorsData || [];

        setTotalVendors(vendors.length);

        const results = await Promise.all(
          vendors.map(async (vendor: Vendor) => {
            try {
              const res = await fetch(
                `https://server.festgo.in/api/admin/property/${vendor.id}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              const data = await res.json();

              if (data && Array.isArray(data.properties)) {
                return data.properties.length > 0 ? 1 : 0;
              }

              return 0;
            } catch {
              return 0;
            }
          })
        );

        const withProps = results.reduce<number>((sum, val) => sum + val, 0);
        setVendorsWithProperties(withProps);
      } catch (err) {
        console.error("Error fetching vendors or properties", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartOptions = {
    chart: {
      height: 120,
      type: "donut" as const,
      fontFamily: "inherit",
      foreColor: "#adb0bb",
      offsetY: 0,
    },
    labels: ["With Properties", "Without Properties"],
    plotOptions: {
      pie: {
        startAngle: 0,
        endAngle: 360,
        donut: {
          size: "85%",
        },
      },
    },
    stroke: {
      show: false,
      colors: ["var(--color-surface-ld)"],
      width: 3,
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    colors: ["#0fb9b1", "#b2efe8"],
    tooltip: {
      theme: "light",
      fillSeriesColor: false,
    },
  };

  const chartSeries = [
    vendorsWithProperties,
    totalVendors - vendorsWithProperties,
  ];

  return (
    <CardBox className="!bg-[#d4f4f2] !shadow-none !rounded-4xl ">
      <div className="flex items-center justify-between mb-2 ">
        <div className="flex items-center gap-3">
          <span className="w-16 h-12 rounded-full flex items-center justify-center bg-[#00ceb6] text-white">
            <Icon icon="solar:banknote-line-duotone" height={24} />
          </span>
          <h5 className="lg:text-sm text-xl text-gray-600 font-medium">
            Vendors Properties
          </h5>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-[10px] items-end">
        <div className="xl:col-span-5 col-span-7">
          <div>
            <h2 className="text-3xl mb-3 font-bold text-gray-800">
              {loading ? <ImSpinner8 className="animate-spin" /> : totalVendors}
            </h2>
            <span className="font-semibold border rounded-full border-black/5 dark:border-white/10 py-0.5  leading-[normal] text-xs bg-white rounded-full text-dark dark:text-darklink">
              <span className="opacity-70">
                {loading
                  ? "Spinning..."
                  : `${vendorsWithProperties} have properties`}
              </span>
            </span>
          </div>
        </div>
        <div className="xl:col-span-7 col-span-5">
          <div className="-mb-3">
            {!loading && (
              <Chart
                options={chartOptions}
                series={chartSeries}
                type="donut"
                height="120px"
                width="100%"
              />
            )}
          </div>
        </div>
      </div>
    </CardBox>
  );
};

export default VendorsProperties;
