import { Suspense } from "react";
import CreateFestForm from "../create/CreatefestForm";

export default function CreateCityFestPage() {
  return (
    <div>
      <Suspense fallback={<p className="text-center mt-10">Loading form...</p>}>
        <CreateFestForm />
      </Suspense>
    </div>
  );
}
