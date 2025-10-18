import { tool } from "ai";
import { z } from "zod";

async function geocodeCity(
  city: string
): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    );

    if (!response.ok) { return null; }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return null;
    }

    const result = data.results[0];
    return {
      latitude: result.latitude,
      longitude: result.longitude,
    };
  } catch {
    return null;
  }
}

export const getWeather = tool({
  description:
    "Get the current weather at a location. You can provide either coordinates or a city name.",
  // Use a single object schema so the generated JSON Schema has type: "object"
  inputSchema: z
    .object({
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      city: z
        .string()
        .optional()
        .describe("City name (e.g., 'San Francisco', 'New York', 'London')"),
    })
    .refine(
      (data) => {
        // Require either both latitude and longitude, or a city
        if (data.city) { return true; }
        return (
          typeof data.latitude === "number" &&
          typeof data.longitude === "number"
        );
      },
      { message: "Provide either a city or both latitude and longitude" }
    ),
  execute: async (input) => {
    let latitude: number;
    let longitude: number;

    if (input.city) {
      const coords = await geocodeCity(input.city);
      if (!coords) {
        return {
          error: `Could not find coordinates for "${input.city}". Please check the city name.`,
        };
      }
      latitude = coords.latitude;
      longitude = coords.longitude;
    } else {
      // biome-ignore lint/style/noNonNullAssertion: false positive
      latitude = input.latitude!;
      // biome-ignore lint/style/noNonNullAssertion: false positive
      longitude = input.longitude!;
    }

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`
    );

    const weatherData = await response.json();

    if (input.city) {
      weatherData.cityName = input.city;
    }

    return weatherData;
  },
});
