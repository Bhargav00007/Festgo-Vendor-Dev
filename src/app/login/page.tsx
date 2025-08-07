"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LuEye, LuEyeClosed } from "react-icons/lu";
import Image from "next/image";

export default function VendorLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("vendorToken");
    if (token) {
      router.replace("/vendorlist");
    } else {
      setCheckingAuth(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
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

      localStorage.setItem("vendorToken", data.jwtToken);
      localStorage.setItem("logindata", JSON.stringify(data));
      router.push("/vendorlist");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Something went wrong");
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) return null;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#e9e9e9] md:bg-white">
      {/* Left Side - Image */}
      <div className="md:w-1/2 w-full bg-[#e9e9e9] flex items-center justify-center md:min-h-screen">
        <div className="w-full px-8">
          <Image
            src="/image.png"
            alt="Login Illustration"
            width={800}
            height={800}
            className="w-[500px] mx-auto h-auto object-contain"
          />
        </div>
      </div>

      <div className="md:w-1/2 w-full flex items-center justify-center px-6 py-10 bg-white">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md space-y-4 bg-white rounded-xl p-6 "
        >
          <h2 className="text-3xl font-bold text-center text-gray-800">
            Sign In
          </h2>

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

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <LuEyeClosed /> : <LuEye />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition cursor-pointer"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
