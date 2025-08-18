"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FestbiteCreatePage() {
  const router = useRouter();
  const [typeName, setTypeName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!typeName.trim()) {
      setError("Menu type name is required.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("vendorToken");
      if (!token) {
        setError("No token found. Please login first.");
        setLoading(false);
        return;
      }

      const res = await fetch(
        "https://server.festgo.in/api/festbite/menu-types",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ typeName }),
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to create: ${res.status}`);
      }

      const data = await res.json();
      console.log("Created FestBite Menu Type:", data);

      setSuccess("Menu type created successfully!");
      setTypeName("");

      // ✅ Redirect back to list page after 1.5s
      setTimeout(() => {
        router.push("/festbite"); // change to your FestBite list route
      }, 1500);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-6 mt-20 ">
      <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
        Create FestBite Menu Type
      </h1>
      <p className="mb-6 text-gray-600 text-lg">
        Add a new menu type to FestBite
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="typeName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Menu Type Name
          </label>
          <input
            id="typeName"
            type="text"
            value={typeName}
            onChange={(e) => setTypeName(e.target.value)}
            placeholder="e.g. Veg Menu"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-2 px-4 rounded-full shadow-md hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Menu Type"}
        </button>
      </form>
    </div>
  );
}
