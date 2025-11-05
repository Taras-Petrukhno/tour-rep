"use client";

import "./pageStyle.sass";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getPrice, getHotel } from "@/api";

import Services from "@/src/components/Services";
import { Hotel, Price } from "@/src/types/entities";

export default function TourPage() {
  const searchParams = useSearchParams();
  const priceId = searchParams.get("priceId");
  const hotelId = +searchParams.get("hotelId")!;
  // const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [price, setPrice] = useState<Price | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!hotelId || !priceId) return;
      console.log("priceId: ", priceId, "hotelid: ", hotelId);
      try {
        setLoading(true);
        const priceRes = await getPrice(priceId);
        if (!priceRes.ok) {
          throw new Error(`Не змогли отримати ціни(: ${priceRes.status}`);
        }
        const price = await priceRes.json();
        console.log(price);
        setPrice(price);
        const hotelRes = await getHotel(+hotelId);
        if (!hotelRes.ok) {
          throw new Error(
            `Не змогли отримати дані про готель(: ${hotelRes.status}`
          );
        }
        const hotel = await hotelRes.json();
        setHotel(hotel);

        console.log("price: ", price, "hotel: ", hotel);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [hotelId, priceId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div>
      {hotel && price && (
        <article className="tour-card">
          <h1 className="tour-card__name">{hotel.name}</h1>
          <p className="tour-card__location">
            <span>{hotel.countryName}</span>
            <span>{hotel.cityName}</span>
          </p>
          <img className="tour-card__img" src={hotel.img} alt={hotel.name} />
          <h2 className="tour-card__title">Опис</h2>
          <p className="tour-card__description">{hotel.description}</p>
          <h2 className="tour-card__title">Сервіси</h2>
          <Services services={hotel.services as any} />
          <p className="tour-card__date">
            <img className="tour-card__date-img" src="pages/calendar.png" />
            <span>
              {new Date(price.startDate).toLocaleDateString("uk-UA")}
              {" / "}
              {new Date(price.endDate).toLocaleDateString("uk-UA")}
            </span>
          </p>
          <p className="tour-card__price">
            {new Intl.NumberFormat("uk-UA", {
              style: "currency",
              currency: price.currency.toUpperCase(),
              minimumFractionDigits: 0,
            }).format(+price.amount)}
          </p>
        </article>
      )}
    </div>
  );
}
