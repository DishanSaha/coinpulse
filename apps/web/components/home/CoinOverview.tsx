import { fetcher } from "@/lib/coingecko.actions";
import { formatCurrency } from "@/lib/utils";
import { CoinDetailsData, OHLCData } from "@/type";
import Image from "next/image";
import React from "react";
import { CoinOverviewFallback } from "./fallback";
import CandleStickChart from "../CandleStickChart";

const CoinOverview = async () => {
  let coin: CoinDetailsData | null = null;
  let coinOHLCData: OHLCData[] | null = null;
  try {
    const result = await Promise.all([
      fetcher<CoinDetailsData>("/coins/bitcoin", {
        dex_pair_format: "symbol",
      }),
      fetcher<OHLCData[]>("/coins/bitcoin/ohlc", {
        vs_currency: "usd",
        days: 1,
      }),
    ]);

    coin = result[0];
    coinOHLCData = result[1] || null;
  } catch (error) {
    console.error("Failed to fetch coin details:", error);
    return <CoinOverviewFallback />;
  }

  if (!coin) {
    return <CoinOverviewFallback />;
  }

  return (
    <div id="coin-overview">
      <CandleStickChart data={coinOHLCData} coinId="bitcoin">
        <div className="header pt-2">
          <Image
            src={coin.image.large}
            alt={coin.name}
            width={56}
            height={56}
          />

          <div className="info">
            <p>
              {coin.name} / {coin.symbol.toUpperCase()}
            </p>

            <h1>{formatCurrency(coin.market_data.current_price.usd)}</h1>
          </div>
        </div>
      </CandleStickChart>
    </div>
  );
};

export default CoinOverview;
