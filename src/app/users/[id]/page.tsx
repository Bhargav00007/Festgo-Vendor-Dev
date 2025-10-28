"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ArrowLeft, Coins } from "lucide-react";
import { BarLoader } from "react-spinners";

interface CoinHistory {
  status: string;
  type: string;
  reason: string;
  referenceId: string | null;
  coins: number;
  createdAt: string;
}

interface CoinData {
  user: { id: string; name: string; email: string };
  coins: { total: number; active: number; expired: number };
  history: CoinHistory[];
}

export default function UserDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<CoinData | null>(null);
  const [loading, setLoading] = useState(true);

  const token = useMemo(
    () =>
      typeof window !== "undefined"
        ? localStorage.getItem("vendorToken")
        : null,
    []
  );

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://server.festgo.in/api/admin/users/${id}/coins`,
        {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
          cache: "no-store",
        }
      );
      if (!res.ok) throw new Error("Failed to fetch user coins");
      const body = await res.json();
      setData(body.data);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error fetching user details"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <BarLoader color="#4A90E2" loading={loading} />
      </div>
    );

  if (!data)
    return (
      <div className="p-10 text-center text-gray-700">
        <p>No data found</p>
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl p-6 my-20">
      <ToastContainer />
      <button
        onClick={() => router.push("/users")}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2 cursor-pointer" /> Back to Users
      </button>

      <div className="rounded-xl border border-gray-300 bg-white p-6 shadow-sm mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {data.user.name}
        </h1>
        <p className="text-gray-600">{data.user.email}</p>
      </div>

      {/* Coin Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          {
            label: "Total Coins",
            value: data.coins.total,
            color: "text-yellow-600",
          },
          {
            label: "Active Coins",
            value: data.coins.active,
            color: "text-green-600",
          },
          {
            label: "Expired Coins",
            value: data.coins.expired,
            color: "text-red-600",
          },
        ].map((c) => (
          <div
            key={c.label}
            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 ${c.color}`}
            >
              <Coins className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className="text-xl font-semibold">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* History Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-300 bg-white">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 border-b border-gray-300">
            <tr>
              <th className="px-4 py-3 text-xs text-gray-500 uppercase">
                Reason
              </th>
              <th className="px-4 py-3 text-xs text-gray-500 uppercase">
                Type
              </th>
              <th className="px-4 py-3 text-xs text-gray-500 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-xs text-gray-500 uppercase">
                Coins
              </th>
              <th className="px-4 py-3 text-xs text-gray-500 uppercase">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {data.history.map((h, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-3">{h.reason}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{h.type}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{h.status}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{h.coins}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(h.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
