"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VendorLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // If already logged in, redirect to /vendorslist
  useEffect(() => {
    const token = localStorage.getItem("vendorToken");
    if (token) {
      router.replace("/vendorslist");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("https://server.festgo.in/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.jwtToken) {
        throw new Error(
          data?.message || "Invalid credentials or login failed."
        );
      }

      // Save token and redirect
      localStorage.setItem("vendorToken", data.jwtToken);
      router.push("/vendorslist");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Something went wrong");
      } else {
        setError("Something went wrong");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 -mt-20">
      <form
        onSubmit={handleLogin}
        className="max-w-md w-full bg-white p-8 rounded-3xl shadow-sm space-y-4 border border-gray-200"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">Login</h2>

        {error && (
          <p className="text-red-600 text-sm text-center bg-red-50 p-2 rounded-lg">
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring"
        />

        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition cursor-pointer"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
