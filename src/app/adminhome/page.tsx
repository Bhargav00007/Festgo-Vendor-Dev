"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { MdPhotoLibrary, MdLocalOffer } from "react-icons/md";

export default function AdminHomePage() {
  const router = useRouter();

  const sections = [
    {
      title: "Banner",
      icon: <MdPhotoLibrary className="h-10 w-10 text-blue-600" />,
      path: "/adminhome/adminbanner",
    },
    {
      title: "Offers",
      icon: <MdLocalOffer className="h-10 w-10 text-green-600" />,
      path: "/adminhome/adminoffers",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl p-6 my-20">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Admin Home
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Manage banners, offers, and homepage content
        </p>
      </div>

      {/* Subheading */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
        Dashboard Options
      </h2>

      {/* Two clickable cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 justify-items-center">
        {sections.map((section, idx) => (
          <div
            key={idx}
            onClick={() => router.push(section.path)}
            className="flex flex-col items-center justify-center w-full max-w-sm rounded-xl border border-gray-200 bg-white shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer p-8"
          >
            <div className="mb-4">{section.icon}</div>
            <h3 className="text-xl font-semibold text-gray-800">
              {section.title}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
}
