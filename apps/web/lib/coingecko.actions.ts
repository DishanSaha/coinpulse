"use server";

import qs from "query-string";

const BASE_URL = process.env.COINGECKO_BASE_URL;
const API_KEY = process.env.COINGECKO_API_KEY;

type QueryParams = Record<string, string | number | boolean | undefined>;

type CoinGeckoErrorBody = {
  error?: string;
  errorStatus?: number;
};

if (!BASE_URL) {
  throw new Error("could not get base url");
}
if (!API_KEY) {
  throw new Error("could not get API key");
}

export async function fetcher<T>(
  endpoint: string,
  params?: QueryParams,
  revalidate: number = 60,
): Promise<T> {
  const url = qs.stringifyUrl(
    {
      url: `${BASE_URL}/${endpoint}`,
      query: params,
    },
    { skipEmptyString: true, skipNull: true },
  );

  const response = await fetch(url, {
    headers: {
      "x-cg-api-key": API_KEY!,
      "content-type": "application/json",
    },
    next: {
      revalidate,
    },
  });

  if (!response.ok) {
    const errorBody: CoinGeckoErrorBody = await response
      .json()
      .catch(() => ({}));

    throw new Error(
      `API Error: ${response.status}: ${errorBody.error || errorBody.errorStatus}`,
    );
  }

  return response.json();
}
