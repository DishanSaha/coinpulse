import Datatable from "../Datatable";
import { DataTableColumn } from "@/type";

const skeletonRows = Array.from({ length: 6 }, (_, index) => ({
  id: `skeleton-${index}`,
}));

const trendingColumns: DataTableColumn<{ id: string }>[] = [
  {
    header: "Name",
    cell: () => (
      <div className="name-link">
        <div className="name-image skeleton" />
        <div className="name-line skeleton" />
      </div>
    ),
  },
  {
    header: "24h Change",
    cell: () => (
      <div className="change-cell">
        <div className="change-icon skeleton" />
        <div className="change-line skeleton" />
      </div>
    ),
  },
  {
    header: "Price",
    cell: () => <div className="price-line skeleton" />,
  },
];

export const CoinOverviewFallback = () => {
  return (
    <div id="coin-overview-fallback">
      <div className="header">
        <div className="header-image skeleton" />
        <div className="info">
          <div className="header-line-sm skeleton" />
          <div className="header-line-lg skeleton" />
          <div className="flex gap-2 items-center mt-2">
            <div className="period-button-skeleton skeleton" />
            <div className="period-button-skeleton skeleton" />
          </div>
        </div>
      </div>
      <div className="chart">
        <div className="chart-skeleton skeleton" />
      </div>
    </div>
  );
};

export const TrendingCoinsFallback = () => {
  return (
    <div id="trending-coins-fallback">
      <h4>Trending Coins</h4>
      <Datatable
        data={skeletonRows}
        columns={trendingColumns}
        rowKey={(row) => row.id}
        tableClassName="trending-coins-table"
      />
    </div>
  );
};

const categoriesSkeletonRows = Array.from({ length: 10 }, (_, index) => ({
  id: `categories-skeleton-${index}`,
}));

const categoriesColumns: DataTableColumn<{ id: string }>[] = [
  {
    header: "Category",
    cell: () => <div className="category-skeleton skeleton" />,
  },
  {
    header: "Top Gainers",
    cell: () => (
      <div className="top-gainers-cell">
        <div className="coin-skeleton skeleton" />
        <div className="coin-skeleton skeleton" />
        <div className="coin-skeleton skeleton" />
      </div>
    ),
  },
  {
    header: "Market Cap",
    cell: () => <div className="value-skeleton-lg skeleton" />,
  },
  {
    header: "Volume 24h",
    cell: () => <div className="value-skeleton-lg skeleton" />,
  },
  {
    header: "24h Change",
    cell: () => (
      <div className="change-cell">
        <div className="change-icon skeleton" />
        <div className="value-skeleton-sm skeleton" />
      </div>
    ),
  },
];

export const CategoriesFallback = () => {
  return (
    <div id="categories-fallback">
      <h4>Top Categories</h4>
      <Datatable
        data={categoriesSkeletonRows}
        columns={categoriesColumns}
        rowKey={(row) => row.id}
        tableClassName="mt-3"
      />
    </div>
  );
};
