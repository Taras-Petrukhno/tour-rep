import {
  useEffect,
  useState,
  useRef,
  FormEvent,
  Dispatch,
  SetStateAction,
} from "react";
import Image from "next/image";

import { Tour, GetSearchPricesResponse, PriceItem } from "@/src/types/entities";
import {
  getCountries,
  searchGeo,
  startSearchPrices,
  getSearchPrices,
  getHotels,
  stopSearchPrices,
} from "@/api";
import { Country, Hotel, City } from "@/src/types/entities";
import cityImage from "@/public/components/CountriesSelect/city.png";
import hotelImage from "@/public/components/CountriesSelect/hotel.png";

type GeoEntity = Country | City | Hotel;
class FetchPricesStepOneError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FetchPricesStepOneError";
  }
}
class FetchPricesStepTwoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FetchPricesStepTwoError";
  }
}
class FetchHotelsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FetchHotelsError";
  }
}
export default function CountriesInput({
  apiErrorHandler,
  setTours,
}: {
  apiErrorHandler: (err: any) => void;
  setTours: (tours: Tour[]) => void;
}) {
  const [loadingMenu, setLoadingMenu] = useState<boolean>(false);
  const [places, setPlaces] = useState<GeoEntity[]>([]);
  const [search, setSearch] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<GeoEntity | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const [lastToken, setLastToken] = useState<string | null>(null);
  const [tokenWaiting, setTokenWaiting] = useState<boolean>(false);
  const activeSearchToken = useRef(0);
  let retry: number = 0;
  let timeoutID: ReturnType<typeof setTimeout> | null = null;
  let resolveTimerPromise: ((reason?: any) => void) | null = null;

  async function fetchCountries() {
    try {
      setLoadingMenu(true);
      const response = await getCountries();
      const data: Country[] = await response.json();
      if (response.ok) {
        setPlaces(Object.values(data));
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
    } finally {
      setLoadingMenu(false);
    }
  }

  async function fetchSearchedGeo() {
    if (search.trim() === "") return;
    try {
      setLoadingMenu(true);
      const response = await searchGeo(search);
      const data = await response.json();
      if (response.ok) {
        setPlaces(Object.values(data));
      }
    } catch (error) {
      console.error("Error fetching searchGeo:", error);
    } finally {
      setLoadingMenu(false);
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
    if ((selected && !("type" in selected)) || selected?.type === "country")
      fetchCountries();
    setIsOpen(true);
  }

  function clearInput() {
    setSearch("");
    setSelected(null);
  }

  async function formHandler(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const thisToken = ++activeSearchToken.current;

    const countryID =
      selected && "countryId" in selected ? selected?.countryId : selected?.id;

    async function fetchPricesStepOne() {
      try {
        const resToken = await startSearchPrices(countryID);
        if (!resToken.ok) throw Error(resToken.statusText);
        const dataToken = await resToken.json();
        return dataToken;
      } catch (err: any) {
        throw new FetchPricesStepOneError(
          "fetchPricesStepOne Error: " + err.message
        );
      }
    }

    async function fetchPricesStepTwo(dataToken: {
      token: string;
      waitUntil: string;
    }) {
      if (thisToken !== activeSearchToken.current) return null;
      try {
        const timeout: number =
          new Date(dataToken.waitUntil).getTime() - Date.now();
        const prices = await new Promise((resolve, reject) => {
          if (timeoutID && resolveTimerPromise) {
            resolveTimerPromise();
            clearTimeout(timeoutID);
          }
          resolveTimerPromise = resolve;
          timeoutID = setTimeout(async () => {
            if (thisToken !== activeSearchToken.current) return resolve(null);
            try {
              const res = await getSearchPrices(dataToken.token);
              if (!res.ok) {
                throw new Error(`getSearchPrices failed: ${res.status}`);
              }
              const data = await res.json();
              resolve(data);
            } catch (err) {
              reject(err);
            }
          }, timeout);
        });
        return prices;
      } catch (err: unknown) {
        if (err instanceof Error)
          throw new FetchPricesStepTwoError(
            "fetchPricesStepTwo Error: " + err.message
          );
      }
    }

    async function fetchHotels(prices: any) {
      if (thisToken !== activeSearchToken.current) return null;
      try {
        const hotelsResponse = await getHotels(countryID);
        const hotels = await hotelsResponse.json();
        const arrayPrices = Object.values(prices).flatMap((price: any) =>
          Object.values(price)
        );
        console.log(";", arrayPrices);
        const arrayHotels = Object.values(hotels);

        let tours = arrayPrices.map((price: any) => {
          const matchHotel = arrayHotels.find(
            (hotel: any) => price.hotelID == hotel.id
          );
          if (matchHotel) price.hotel = matchHotel;

          return price;
        });
        tours = tours.filter((tour) => "hotel" in tour);
        setTours(tours);

        console.log(
          "\nprices:",
          prices,
          "\nhotels:",
          hotels,
          "\ntours:",
          tours
        );
      } catch (err) {
        if (err instanceof Error)
          throw new FetchHotelsError("FetchHotels Error: " + err.message);
      }
    }

    async function submit() {
      if (!selected) return;
      try {
        if (tokenWaiting) {
          await stopSearchPrices(lastToken);
          if (timeoutID && resolveTimerPromise) {
            resolveTimerPromise();
            clearTimeout(timeoutID);
          }
        }
        setTokenWaiting(true);
        const dataToken = await fetchPricesStepOne();
        if (!dataToken || thisToken !== activeSearchToken.current) return;
        setLastToken(dataToken?.token);
        const prices = await fetchPricesStepTwo(dataToken);
        if (!prices || thisToken !== activeSearchToken.current) return;
        await fetchHotels(prices);
        if (thisToken !== activeSearchToken.current) return;
        setTokenWaiting(false);
      } catch (err) {
        console.log("retry");
        console.log(err);

        setTokenWaiting(false);
        if (retry >= 2) {
          retry = 0;
          apiErrorHandler(err);
          return;
        } else {
          retry += 1;
          await submit();
        }
      }
    }
    submit();
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

        {isOpen && !!places.length && (
          <ul className="countries-select__list">
            {loadingMenu && <li>Завантажуємо...</li>}
            {places.map((country: GeoEntity) => (
              <li
                key={country.id}
                className="countries-select__item"
                onClick={() => selectOption(country)}
              >
                {!!(country as any).flag && (
                  <img
                    src={(country as any).flag}
                    alt={country.name}
                    className="countries-select__flag"
                    width={40}
                    height={40}
                  />
                )}
                {(country as any).type === "city" && (
                  <Image
                    src={cityImage}
                    alt={country.name}
                    className="countries-select__flag"
                    width={40}
                    height={40}
                  />
                )}
                {(country as any).type === "hotel" && (
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
            (tokenWaiting ? " countries-select__submit--in-process" : "")
          }
        >
          {tokenWaiting ? "Шукаєм" : "Знайти"}
        </button>
      </div>
    </form>
  );
}
