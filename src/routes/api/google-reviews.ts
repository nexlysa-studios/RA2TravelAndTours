import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

type GooglePlaceReview = {
  author_name?: string;
  rating?: number;
  relative_time_description?: string;
  text?: string;
};

type GooglePlaceDetailsPayload = {
  status?: string;
  error_message?: string;
  result?: {
    name?: string;
    reviews?: GooglePlaceReview[];
  };
};

const getRuntimeEnv = (key: string) => {
  const viteEnv = import.meta.env as Record<string, string | undefined>;
  const processEnv = globalThis.process?.env as
    | Record<string, string | undefined>
    | undefined;

  return (
    viteEnv[key] || processEnv?.[key] || globalThis.__CLOUDFLARE_ENV__?.[key]
  );
};

const jsonResponse = (payload: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(payload), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

export const Route = createFileRoute("/api/google-reviews")({
  server: {
    handlers: {
      GET: async () => {
        const googlePlaceId = getRuntimeEnv("GOOGLE_PLACE_ID");
        const googlePlacesApiKey = getRuntimeEnv("GOOGLE_PLACES_API_KEY");

        if (!googlePlacesApiKey || !googlePlaceId) {
          return jsonResponse(
            {
              reviews: [],
            },
            { status: 200 },
          );
        }

        const url = new URL(
          "https://maps.googleapis.com/maps/api/place/details/json",
        );
        url.search = new URLSearchParams({
          place_id: googlePlaceId,
          fields: "name,rating,url,reviews,formatted_address",
          key: googlePlacesApiKey,
        }).toString();

        const response = await fetch(url);
        if (!response.ok) {
          return jsonResponse(
            { error: "Unable to fetch Google reviews." },
            { status: response.status },
          );
        }

        const payload = (await response.json()) as GooglePlaceDetailsPayload;
        if (
          payload.status !== "OK" ||
          !Array.isArray(payload.result?.reviews)
        ) {
          return jsonResponse(
            {
              error: "Google reviews were unavailable.",
              status: payload.status,
              message: payload.error_message,
            },
            { status: 502 },
          );
        }

        if (!/ra2/i.test(payload.result.name ?? ""))
          return jsonResponse({ reviews: [] });

        const reviews = payload.result.reviews.slice(0, 6).map((review) => ({
          name: review.author_name,
          origin: review.relative_time_description || "Google review",
          rating: Math.round(review.rating ?? 5),
          text: review.text || "",
        }));

        return jsonResponse(
          {
            businessName: payload.result.name,
            reviews,
          },
          {
            headers: {
              "Cache-Control":
                "public, max-age=0, s-maxage=60, stale-while-revalidate=60",
            },
          },
        );
      },
    },
  },
});
