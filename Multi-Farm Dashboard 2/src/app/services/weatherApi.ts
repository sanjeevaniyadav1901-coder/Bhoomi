import { ReactNode } from "react";
import { SoilData } from "../types";

export async function fetchWeather(city: string) {
  try {
    const res = await fetch(`http://127.0.0.1:5000/weather/${city}`);

    if (!res.ok) {
      return { error: "Failed to fetch weather" }; // ✅ FIXED
    }

    const data = await res.json();

    console.log("RAW API DATA 👉", data);

    return {
      temperature: data?.temperature ?? data?.main?.temp ?? 0,
      humidity: data?.humidity ?? data?.main?.humidity ?? 0,
      windSpeed: data?.windSpeed ?? data?.wind?.speed ?? 0,
      rainfall: data?.rainfall ?? data?.rain?.["1h"] ?? 0,

      // ⚠️ clouds.all ≠ real rain probability, but okay fallback
      rainProbability: data?.rainProbability ?? data?.clouds?.all ?? 0,

      condition: data?.condition ?? data?.weather?.[0]?.description ?? "N/A",
    };

  } catch (error) {
    console.error(error);

    // ✅ IMPORTANT: return error field for frontend check
    return { error: "Something went wrong" };
  }
}
// ---------------- ZONE ----------------

export interface Zone {
  status: string;
  moisture: ReactNode;
  id: string;
  name: string;
  area: number;

  moistureLevel: 'dry' | 'medium' | 'wet';

  irrigationStatus: 'active' | 'idle' | 'scheduled';

  lastIrrigation: string;
  nextScheduled?: string;

  soilData: SoilData;
}
