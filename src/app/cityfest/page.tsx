import React, { Suspense } from "react";
import FestListPage from "./FestListPage";

export default function CityFestPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FestListPage />
    </Suspense>
  );
}
