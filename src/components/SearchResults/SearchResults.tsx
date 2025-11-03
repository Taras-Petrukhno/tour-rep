import { Tour } from "@types/entities";
import Link from "next/link";

export default function SearchResults({ tours }: { tours: Tour[] }) {
  return (
    <section className="tour-list">
      {tours.length == 0 && (
        <h3 className="tour__empty-state">
          По цьому запиту, турів поки немає, але невдовзі вони зʼявляться
        </h3>
      )}
      {tours.map((tour) => (
        <article className="tour" key={tour.id}>
          <h3 className="tour__title">{tour.hotel.name}</h3>
          <p className="tour__place">
            {tour.hotel.countryName}, {tour.hotel.cityName}
          </p>
          <p className="tour__date">
              {new Date(tour.startDate).toLocaleDateString("uk-UA")}
          </p>
          <img
            className="tour__img"
            src={tour.hotel.img}
            alt={tour.hotel.name}
          />
          <b className="tour__price">
            {new Intl.NumberFormat("uk-UA", {
              style: "currency",
              currency: tour.currency.toUpperCase(),
              minimumFractionDigits: 0,
            }).format(+tour.amount)}
          </b>
          <Link
            href={`/tour?priceId=${tour.id}&hotelId=${tour.hotelID}`}
            className="tour__link"
            target="_blank"
          >
            Відкрити ціну
          </Link>
        </article>
      ))}
    </section>
  );
}
