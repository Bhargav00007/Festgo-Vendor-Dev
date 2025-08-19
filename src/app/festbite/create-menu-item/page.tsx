"use client";

import { Suspense } from "react";
import CreateItem from "../create-menu-item/CreateItems";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <CreateItem />
    </Suspense>
  );
}
