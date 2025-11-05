export interface Country {
  id: string;
  name: string;
  flag: string;
}

export interface City {
  id: number;
  name: string;
  countryId: string;
}

export interface Hotel {
  id: number;
  name: string;
  img: string;
  cityId: number;
  cityName: string;
  countryId: string;
  countryName: string;
  description?: string;
  services?: HotelServices;
}

export interface HotelServices {
  wifi: "yes" | "no" | "none";
  aquapark: "yes" | "no" | "none";
  tennis_court: "yes" | "no" | "none";
  laundry: "yes" | "no" | "none";
  parking: "yes" | "no" | "none";
}

export interface Price {
  id: string;
  amount: number;
  currency: "usd" | "eur" | "uah";
  startDate: string; 
  endDate: string;   
  hotelID?: number;  
}

export interface Tour {
  id: string;
  amount: number;
  currency: string;
  startDate: string;
  endDate: string;
  hotelID: string;
  hotel: {
    id: number;
    name: string;
    img: string;
    cityId: number;
    cityName: string;
    countryId: string;
    countryName: string;
  };
};



export interface PriceItem  {
id: string;
amount: number;
currency: string;
startDate: string; // consider using Date if parsing
endDate: string; // consider using Date if parsing
hotelID: string;
hotel: {
  id: number;
name: string;
img: string;
cityId: number;
cityName: string;
countryId: string;
countryName: string;
};
};

export interface GetSearchPricesResponse {
  prices: Record<string, PriceItem>;
};

const ObjectMap = {
  aquapark: "Water park",
  laundry: "Laundry",
  parking: "Parking",
  tennis_court: "Tennis court",
  wifi: "Wi-Fi",
} as const;

export type ServiceKey = keyof typeof ObjectMap;
export type ServiceStatus = "yes" | "none";
export type ServicesT = Record<ServiceKey, ServiceStatus>;