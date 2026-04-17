import { fetcher } from "@/lib/coingecko.actions";
import { DataTableColumn, TrendingCoin } from "@/type";
import Datatable from "../Datatable";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import { TrendingCoinsFallback } from "./fallback";

const TrendingCoins = async () => {

  let trendingCoins;
  try {
    trendingCoins = await fetcher<{ coins: TrendingCoin[] }>(
      "search/trending",
      undefined,
      60,
    );
  } catch (error) {
    console.error("Failed to fetch trending coins:", error);
    return <TrendingCoinsFallback />;
  }

  const columns: DataTableColumn<TrendingCoin>[] = [
    {
      header: "Name",
      cellClassName: "name-cell",
      cell: (coin) => {
        const item = coin.item;
        return (
          <Link href={`/coins/${item.id}`}>
            <Image src={item.large} alt={item.name} width={36} height={36} />
            <span>{item.name}</span>
          </Link>
        );
      },
    },
    {
      header: "24h Change",
      cellClassName: "name-cell",
      cell: (coin) => {
        const item = coin.item;
        const isTrendingUp = item.data.price_change_percentage_24h.usd > 0;

        return (
          <div
            className={cn(
              "price-change",
              isTrendingUp ? "text-green-500" : "text-red-500",
            )}
          >
            <p>
              {isTrendingUp ? (
                <TrendingUp width={16} height={16} />
              ) : (
                <TrendingDown width={16} height={16} />
              )}
              {Math.abs(item.data.price_change_percentage_24h.usd).toFixed(2) +
                "%"}
            </p>
          </div>
        );
      },
    },
    {
      header: "Price",
      cellClassName: "price-cell",
      cell: (coin) => `$${coin.item.data.price.toFixed(2)}`,
    },
  ];

  return (
    <div id="trending-coins">
      <p className="text-lg font-semibold mx-5 mb-4">Trending Coins</p>
      <Datatable
        data={trendingCoins.coins.slice(0, 6) || []}
        columns={columns}
        rowKey={(row) => row.item.id}
        tableClassName="trending-coins-table"
        headerCellClassName="py-3!"
        bodyCellClassName="py-2"
      />
    </div>
  );
};

export default TrendingCoins;
