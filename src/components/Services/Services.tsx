const ObjectMap = {
  aquapark: "Water park",
  laundry: "Laundry",
  parking: "Parking",
  tennis_court: "Tennis court",
  wifi: "Wi-Fi",
};

export default function Services({
  services,
}: {
  service: Record<string, "yes" | "none">;
}) {
  return (
    <ul className="service__list">
      {Object.entries(services).map((service) => {
        if (service[1] === "yes" && service[0] in ObjectMap) {
          return (
            <li className="service__item" key={service[0]}>
              <img
                className="service__img"
                src={`components/Service/${service[0]}.png`}
                alt={ObjectMap[service[0]]}
              />
              <span className="service__text">{ObjectMap[service[0]]}</span>{" "}
            </li>
          );
        }
      })}
    </ul>
  );
}
