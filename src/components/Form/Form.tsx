import { useEffect, useState, useRef, FormEvent } from "react";
import Image from "next/image";

import {
  getCountries,
  searchGeo,
  startSearchPrices,
  getSearchPrices,
  getHotels,
} from "@/api";
import { Country, Hotel, City } from "@types/entities";
import cityImage from "@/public/components/CountriesSelect/city.png";
import hotelImage from "@/public/components/CountriesSelect/hotel.png";

type GeoEntity = Country | City | Hotel;

export default function CountriesInput({
  apiErrorHandler,
  setTours,
}: {
  apiErrorHandler: (error: Error) => void;
  setTours: (tours: []) => void;
}) {
  const [loading, setLoading] = useState<boolean>(false);
  const [places, setPlaces] = useState<GeoEntity[]>([]);
  const [search, setSearch] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<GeoEntity | null>(null);
  const [isOpen, setIsOpen] = useState(true);

  const [isWaitingToken, setIsWaitingToken] = useState(false);
  const [prices, setPrices] = useState({});

  async function fetchCountries() {
    try {
      setLoading(true);
      const response = await getCountries();
      const data: Country[] = await response.json();
      if (response.ok) {
        setPlaces(Object.values(data));
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSearchedGeo() {
    if (search.trim() === "") return;
    try {
      setLoading(true);
      const response = await searchGeo(search);
      const data = await response.json();
      if (response.ok) {
        setPlaces(Object.values(data));
      }
    } catch (error) {
      console.error("Error fetching searchGeo:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    fetchSearchedGeo();
  }, [search]);

  function selectOption(place: GeoEntity) {
    setSelected(place);
    setSearch(place.name);
    setIsOpen(false);
    inputRef.current?.focus();
  }

  function openInput() {
    if (isOpen === true) return;
    if (!selected?.type || selected?.type === "country") fetchCountries();
    setIsOpen(true);
  }

  function clearInput() {
    setSearch("");
    setSelected(null);
  }

  async function formHandler(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    let cooldown: Date | null = null;
    let attempt = 0;
    const maxPermitedAttempts = 3;
    const countryID =
      "countryId" in selected ? selected.countryId : selected.id;
    setIsWaitingToken(true);

    async function fetchPrices() {
      // check on permit
      if (cooldown && cooldown.getTime() - Date.now() > 0) return;
      if (!selected) return;
      attempt++;

      try {
        const resToken = await startSearchPrices(countryID);
        const dataToken = await resToken.json();
        cooldown = new Date(dataToken.waitUntil);

        const timeout: number = cooldown.getTime() - Date.now();

        const prices = await new Promise((resolve, reject) =>
          setTimeout(async () => {
            try {
              const res = await getSearchPrices(dataToken.token);
              const data = await res.json();
              resolve(data);
            } catch (err) {
              reject(err);
            }
          }, timeout)
        );
        attempt = maxPermitedAttempts;
        setPrices(prices);
      } catch (err) {
        // retry
        console.log(err);
        if (attempt >= maxPermitedAttempts) {
          apiErrorHandler(err);
          return;
        }
        await fetchPrices();
      }
    }
    await fetchPrices();

    const hotelsResponse = await getHotels(countryID);
    const hotels = await hotelsResponse.json();

    const arrayPrices = Object.values(prices).flatMap((price) =>
      Object.values(price)
    );
    const arrayHotels = Object.values(hotels);

    let tours = arrayPrices.map((price) => {
      const matchHotel = arrayHotels.find((hotel) => price.hotelID == hotel.id);

      if (matchHotel) price.hotel = matchHotel;

      return price;
    });
    tours = tours.filter((tour) => "hotel" in tour);

    console.log("prices", prices);
    console.log("hotels", hotels);
    console.log("tours", tours);
    setTours(tours);
    setIsWaitingToken(false);
  }

  return (
    <form className="countries-select" onSubmit={formHandler}>
      <h2 className="countries-select__title"> Форма пошуку турів</h2>
      <div className="countries-select__block">
        <div className="countries-select__input-wrapper">
          <input
            type="text"
            className="countries-select__input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={openInput}
            ref={inputRef}
          />
          <button
            className="countries-select__reset"
            type="reset"
            onClick={clearInput}
          >
            x
          </button>
        </div>

        {isOpen && (
          <ul className="countries-select__list">
            {loading && <li>Завантажуємо...</li>}

            {places.map((country: GeoEntity) => (
              <li
                key={country.id}
                className="countries-select__item"
                onClick={() => selectOption(country)}
              >
                {!!country.flag && (
                  <img
                    src={country.flag}
                    alt={country.name}
                    className="countries-select__flag"
                    width={40}
                    height={40}
                  />
                )}
                {country.type === "city" && (
                  <Image
                    src={cityImage}
                    alt={country.name}
                    className="countries-select__flag"
                    width={40}
                    height={40}
                  />
                )}
                {country.type === "hotel" && (
                  <Image
                    src={hotelImage}
                    alt={country.name}
                    className="countries-select__flag"
                    width={40}
                    height={40}
                  />
                )}
                <p>{country.name}</p>
              </li>
            ))}
          </ul>
        )}

        <button
          type="submit"
          className={
            "countries-select__submit" +
            (!!selected ? " countries-select__submit--active" : "") +
            (isWaitingToken ? " countries-select__submit--in-process" : "")
          }
        >
          {isWaitingToken ? "Шукаєм" : "Знайти"}
        </button>
      </div>
    </form>
  );
}
