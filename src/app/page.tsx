"use client";

import { useState } from "react";

import Form from "@/src/components/Form";
import SearchResults from "@/src/components/SearchResults";
import ApiErrorModal from "@/src/components/ApiErrorModal/ApiErrorModal";

export default function Home() {
  const [apiError, setApiError] = useState(null);

  return (
    <div>
      <main>
        <Form apiErrorHandler={setApiError} />
        <SearchResults />
      </main>
      <ApiErrorModal error={apiError} btnHandler={setApiError} />
    </div>
  );
}
