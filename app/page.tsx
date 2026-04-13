import CoinOverview from '@/components/home/CoinOverview';
import TrendingCoins from '@/components/home/TrendingCoins';
import { CoinOverviewFallback, TrendingCoinFallback } from '@/components/home/fallback';
import { Suspense } from 'react';

async function page() {
  return (
    <main className="main-container">
      <section className="home-grid">
        <Suspense fallback={<CoinOverviewFallback />}>
          <CoinOverview />
        </Suspense>
        <Suspense fallback={<TrendingCoinFallback />}>
          <TrendingCoins />
        </Suspense>
      </section>
      <section className="w-full mt-7 space-y-7">
        <p>Categories</p>
      </section>
    </main>
  );
}

export default page;
