"use client";
import { ServicesT, ServiceKey } from "@/src/types/entities";

const ObjectMap = {
  aquapark: "Water park",
  laundry: "Laundry",
  parking: "Parking",
  tennis_court: "Tennis court",
  wifi: "Wi-Fi",
} as const;

export default function Services({ services }: { services: ServicesT }) {
  return (
    <ul className="service__list">
      {Object.entries(services).map(([key, value]) => {
        const serviceKey = key as ServiceKey;
        if (value === "yes") {
          return (
            <li className="service__item" key={serviceKey}>
              <img
                className="service__img"
                src={`components/Service/${serviceKey}.png`}
                alt={ObjectMap[serviceKey]}
              />{" "}
              <span className="service__text">{ObjectMap[serviceKey]}</span>{" "}
            </li>
          );
        }
        return null;
      })}{" "}
    </ul>
  );
}
