"use server";

import qs from "query-string";

const BASE_URL = process.env.COINGECKO_BASE_URL;
const API_KEY = process.env.COINGECKO_API_KEY;

if (!BASE_URL) throw new Error("could not get base url");
if (!API_KEY) throw new Error("could not get API key");

export async function fetcher<T>(
  endpoint: string,
  params?: QueryParams,
  revalidate: number = 60,
): Promise<T> {
  const url = qs.stringifyUrl(
    {
      url: `${BASE_URL}${endpoint}`,
      query: params,
    },
    {
      skipEmptyString: true,
      skipNull: true,
    },
  );

  const response = await fetch(url, {
    headers: {
      accept: "application/json",
    },
    next: { revalidate },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({})); // In case the error response is not JSON
    throw new Error(
      `API ERROR: ${response.status} : ${
        errorBody?.error || response.statusText
      }`,
    );
  }

  return response.json();
}
