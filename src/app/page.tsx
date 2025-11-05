"use client";

import { useState } from "react";
import "./pageStyle.sass";
import Form from "@/src/components/Form";
import SearchResults from "@/src/components/SearchResults";
import ApiErrorModal from "@/src/components/ApiErrorModal/ApiErrorModal";

import { Tour } from "@/src/types/entities";

export default function Home() {
  const [apiError, setApiError] = useState(null);
  const [tours, setTours] = useState<Tour[] | null>(null);

  return (
    <div className="home-p">
      <Form apiErrorHandler={setApiError} setTours={setTours} />
      <SearchResults tours={tours} />
      <ApiErrorModal error={apiError} btnHandler={setApiError} />
    </div>
  );
}
