/*eslint-disable @typescript-eslint/no-explicit-any*/
"use client";

import React, { useEffect, useState } from "react";
import { FaUmbrellaBeach, FaHiking, FaCity, FaUtensils } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { ImSpinner8 } from "react-icons/im";
import CardBox from "../shared/CardBox";

// Helper function: count objects containing "id" in any level of JSON
const countIds = (obj: any): number => {
  let count = 0;

  const traverse = (data: any) => {
    if (Array.isArray(data)) {
      data.forEach((item) => traverse(item));
    } else if (typeof data === "object" && data !== null) {
      if ("id" in data) count++;
      Object.values(data).forEach((val) => traverse(val));
    }
  };

  traverse(obj);
  return count;
};

const FestStats = () => {
  const [beachFests, setBeachFests] = useState<number>(0);
  const [trips, setTrips] = useState<number>(0);
  const [cityFests, setCityFests] = useState<number>(0);
  const [menuTypes, setMenuTypes] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("vendorToken");
        if (!token) throw new Error("Token not found");

        const headers = { Authorization: `Bearer ${token}` };

        const [beachRes, tripRes, cityRes, menuRes] = await Promise.all([
          fetch("https://server.festgo.in/api/admin/beach-fests", { headers }),
          fetch("https://server.festgo.in/api/trips", { headers }),
          fetch("https://server.festgo.in/api/city-fests", { headers }),
          fetch("https://server.festgo.in/api/festbite/menu-types", {
            headers,
          }),
        ]);

        const [beachData, tripData, cityData, menuData] = await Promise.all([
          beachRes.json(),
          tripRes.json(),
          cityRes.json(),
          menuRes.json(),
        ]);

        // Use universal "id" counter
        setBeachFests(countIds(beachData));
        setTrips(countIds(tripData));
        setCityFests(countIds(cityData));
        setMenuTypes(countIds(menuData));
      } catch (err) {
        console.error("Error fetching fest stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const cards = [
    {
      title: "Beach Fests",
      value: beachFests,
      icon: <FaUmbrellaBeach className="text-3xl text-blue-600" />,
      color: "bg-[#00000]",
      route: "/fests/list",
    },
    {
      title: "Trips",
      value: trips,
      icon: <FaHiking className="text-3xl text-green-600" />,
      color: "bg-[#00000]",
      route: "/festgotrips",
    },
    {
      title: "City Fests",
      value: cityFests,
      icon: <FaCity className="text-3xl text-purple-600" />,
      color: "bg-[#00000]",
      route: "/cityfest/categories",
    },
    {
      title: "Menu Types",
      value: menuTypes,
      icon: <FaUtensils className="text-3xl text-orange-500" />,
      color: "bg-[#00000]",
      route: "/festbite",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
      {cards.map((card, index) => (
        <CardBox
          key={index}
          className={`!shadow-none !p-0 ${card.color} !rounded-3xl flex flex-col justify-between`}
        >
          <div className="flex flex-col items-start gap-3">
            {card.icon}
            <h5 className="text-gray-600 text-lg font-medium">{card.title}</h5>
            <p className="text-4xl font-semibold text-gray-900">
              {loading ? <ImSpinner8 className="animate-spin" /> : card.value}
            </p>
          </div>

          <button
            onClick={() => router.push(card.route)}
            className="mt-1 px-1 py-2 bg-orange-400 text-white text-sm font-medium rounded-full hover:bg-orange-300 cursor-pointer transition "
          >
            View
          </button>
        </CardBox>
      ))}
    </div>
  );
};

export default FestStats;
