import Categories from "@/components/home/Categories";
import CoinOverview from "@/components/home/CoinOverview";
import TrendingCoins from "@/components/home/TrendingCoins";
import {
  CategoriesFallback,
  CoinOverviewFallback,
  TrendingCoinsFallback,
} from "@/components/home/fallback";
import { Suspense } from "react";

async function page() {
  return (
    <main className="main-container">
      <section className="home-grid">
        <Suspense fallback={<CoinOverviewFallback />}>
          <CoinOverview />
        </Suspense>
        <Suspense fallback={<TrendingCoinsFallback />}>
          <TrendingCoins />
        </Suspense>
      </section>
      <Suspense fallback={<CategoriesFallback />}>
        <Categories />
      </Suspense>
    </main>
  );
}

export default page;
