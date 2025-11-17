/*eslint-disable @typescript-eslint/no-explicit-any*/
"use client";

import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useRouter } from "next/navigation";
import CardBox from "../shared/CardBox";
import { ImSpinner8 } from "react-icons/im";
import { FaImages, FaTags, FaCalendarAlt } from "react-icons/fa";

// Color scheme for pie chart
const COLORS = ["#22c55e", "#ef4444"];

const AdminStats = () => {
  const router = useRouter();
  const [banner, setBanner] = useState<string>("");
  const [offersData, setOffersData] = useState<{
    active: number;
    inactive: number;
  }>({
    active: 0,
    inactive: 0,
  });
  const [eventsCount, setEventsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 1️⃣ Fetch banner (no auth)
        const bannerRes = await fetch(
          "https://server.festgo.in/api/homescreen-banner/"
        );
        const bannerJson = await bannerRes.json();
        setBanner(bannerJson?.data?.content?.[0] || "No banner found");

        // 2️⃣ Fetch offers (Active vs Inactive) with Authorization token
        const token = localStorage.getItem("vendorToken");
        const offersRes = await fetch(
          "https://server.festgo.in/api/offers/get",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const offersJson = await offersRes.json();
        let active = 0;
        let inactive = 0;

        if (Array.isArray(offersJson)) {
          offersJson.forEach((offer: any) => {
            const status = offer?.status?.toLowerCase?.() || "";
            if (status === "active") active++;
            else inactive++;
          });
        } else if (Array.isArray(offersJson?.offers)) {
          offersJson.offers.forEach((offer: any) => {
            const status = offer?.status?.toLowerCase?.() || "";
            if (status === "active") active++;
            else inactive++;
          });
        }

        setOffersData({ active, inactive });

        // 3️⃣ Fetch event types (no auth)
        const eventsRes = await fetch(
          "https://server.festgo.in/api/events/event-types"
        );
        const eventsJson = await eventsRes.json();

        if (Array.isArray(eventsJson)) {
          setEventsCount(eventsJson.length);
        } else if (Array.isArray(eventsJson?.data)) {
          setEventsCount(eventsJson.data.length);
        } else {
          setEventsCount(0);
        }
      } catch (err) {
        console.error("Error fetching admin stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const offerChartData = [
    { name: "Active Offers", value: offersData.active },
    { name: "Inactive Offers", value: offersData.inactive },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
      <CardBox className="!shadow-none !p-0 bg-[#00000] !rounded-3xl md:col-span-2 flex flex-col justify-between">
        <div className="flex flex-col items-start gap-3">
          <div className="flex items-center gap-2">
            <FaImages className="text-blue-600 text-xl" />
            <h5 className="text-gray-600 text-xl font-medium">
              Current Banner
            </h5>
          </div>
          <p className="text-lg text-gray-800 font-semibold">
            {loading ? <ImSpinner8 className="animate-spin" /> : banner}
          </p>
        </div>
        <button
          onClick={() => router.push("/adminhome/adminbanner")}
          className="mt-4 px-4 py-2 bg-orange-400 text-white text-sm font-medium rounded-full cursor-pointer hover:bg-orange-300 transition"
        >
          Manage Banner
        </button>
      </CardBox>

      {/* 2️⃣ Offers Pie Chart */}
      <CardBox className="!shadow-none !p-0 bg-[#00000] !rounded-3xl flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-2">
          <FaTags className="text-green-600 text-xl" />
          <h5 className="text-gray-600 text-lg font-medium">Offers Overview</h5>
        </div>
        <div className="flex-1 h-52">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <ImSpinner8 className="animate-spin text-2xl" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={offerChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={30}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }: any) =>
                    `${name}: ${Math.round((percent ?? 0) * 100)}%`
                  }
                >
                  {offerChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>

                <Tooltip formatter={(value: number) => `${value} Offers`} />
                <Legend verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        {!loading && (
          <p className="text-sm text-gray-700 mt-2">
            Total Offers:{" "}
            <span className="font-semibold">
              {offersData.active + offersData.inactive}
            </span>
          </p>
        )}
        <button
          onClick={() => router.push("/adminhome/adminoffers")}
          className="mt-1 px-4 py-2 bg-orange-400 text-white text-sm font-medium rounded-full cursor-pointer hover:bg-orange-300 transition"
        >
          View Offers
        </button>
      </CardBox>

      {/* 3️⃣ Event Types */}
      <CardBox className="!shadow-none !p-0 bg-[#00000] !rounded-3xl flex flex-col justify-between">
        <div className="flex flex-col items-start gap-3">
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-yellow-500 text-xl" />
            <h5 className="text-gray-600 text-lg font-medium">Events</h5>
          </div>
          <p className="text-4xl font-bold text-gray-900">
            {loading ? <ImSpinner8 className="animate-spin" /> : eventsCount}
          </p>
        </div>
        <button
          onClick={() => router.push("/events")}
          className="mt-1 px-4 py-2 bg-orange-400  text-white text-sm font-medium rounded-full cursor-pointer hover:bg-orange-300 transition"
        >
          View Events
        </button>
      </CardBox>
    </div>
  );
};

export default AdminStats;
