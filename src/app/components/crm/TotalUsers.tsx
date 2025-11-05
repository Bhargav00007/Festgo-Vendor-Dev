"use client";

import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { ImSpinner8 } from "react-icons/im";
import CardBox from "../shared/CardBox";

const TotalUsers = () => {
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("vendorToken");
        if (!token) throw new Error("Token not found");

        const res = await fetch(
          "https://server.festgo.in/api/admin/users?page=1&limit=1",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch users");

        const data = await res.json();

        // ✅ Use pagination.total directly from the API
        const total = data?.pagination?.total || 0;
        setTotalUsers(total);
      } catch (error) {
        console.error("Error fetching users:", error);
        setTotalUsers(0);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <CardBox className="!shadow-none !p-3 !bg-[#e0f2ff] !rounded-4xl ">
      <div className="flex items-center justify-between pb-10">
        <div className="flex items-center gap-3">
          <span className="w-16 h-12 rounded-full flex items-center justify-center bg-blue-500 text-white">
            <Icon icon="solar:users-group-rounded-bold-duotone" height={24} />
          </span>
          <div>
            <h5 className="lg:text-sm text-xl text-gray-600 font-medium">
              Total Users
            </h5>
            <p className="text-4xl font-bold text-gray-900 flex items-center gap-2">
              {loading ? <ImSpinner8 className="animate-spin" /> : totalUsers}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-start mt-2">
        <span className="text-sm px-3 py-1 rounded-full bg-white/70 text-gray-700 font-medium whitespace-nowrap">
          {loading ? "Loading..." : `${totalUsers} Users Registered`}
        </span>
      </div>
    </CardBox>
  );
};

export default TotalUsers;
