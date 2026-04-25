"use client";

import { CandlestickChartProps, OHLCData } from "@/type";
import React, { useCallback, useEffect, useRef, useTransition } from "react";
import { useState } from "react";
import {
  getCandlestickConfig,
  getChartConfig,
  Period,
  PERIOD_BUTTONS,
  PERIOD_CONFIG,
} from "../../constants";
import {
  CandlestickSeries,
  createChart,
  IChartApi,
  ISeriesApi,
} from "lightweight-charts";
import { fetcher } from "@/lib/coingecko.actions";
import { convertOHLCData } from "@/lib/utils";

const CandleStickChart = ({
  data,
  coinId,
  children,
  height = 360,
  initialPeriod = "daily",
}: CandlestickChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState(initialPeriod);
  const [ohlcData, setOhlcData] = useState<OHLCData[]>(data ?? []);
  const [isPending, startTransition] = useTransition();

  const fetchOHLCData = useCallback(
    async (selectedPeriod: Period) => {
      try {
        const { days } = PERIOD_CONFIG[selectedPeriod];

        const newData = await fetcher<OHLCData[]>(`/coins/${coinId}/ohlc`, {
          vs_currency: "usd",
          days,
        });

        setOhlcData(newData ?? []);
      } catch (error) {
        console.error("Error fetching OHLC data:", error);
      }
    },
    [coinId],
  );
  
  const handlePeriodChange = async (newPeriod: Period) => {
    if (newPeriod === period) return;

    await fetchOHLCData(newPeriod);
    startTransition(() => {
      setLoading(true);
      setPeriod(newPeriod);
    });
  };

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const showTime = ["hourly", "daily", "weekly"].includes(period);

    const chart = createChart(container, {
      ...getChartConfig(height, showTime),
      width: container.clientWidth,
    });

    const series = chart.addSeries(CandlestickSeries, getCandlestickConfig());

    chartRef.current = chart;
    candleSeriesRef.current = series;

    //Set data here------
    if (ohlcData?.length) {
      const convertedToSeconds = ohlcData.map(
        (item) =>
          [
            Math.floor(item[0] / 1000),
            item[1],
            item[2],
            item[3],
            item[4],
          ] as OHLCData,
      );

      const converted = convertOHLCData(convertedToSeconds);
      series.setData(converted);
      chart.timeScale().fitContent();
    }

    const observer = new ResizeObserver((entries) => {
      if (!entries.length) return;

      chart.applyOptions({
        width: entries[0].contentRect.width,
      });
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
    };
  }, [height, period, ohlcData]); //ohlcData add

  return (
    <div id="candlestick-chart">
      <div className="chart-header">
        <div className="flex-1">{children}</div>
        <div className="button-group">
          <span className="text-sm mx-2 font-medium text-purple-100/50 ">
            Period:
          </span>
          {PERIOD_BUTTONS.map(({ value, label }) => (
            <button
              className={
                period === value ? "config-button-active" : "config-button"
              }
              key={value}
              onClick={() => handlePeriodChange(value)}
              disabled={isPending}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div ref={chartContainerRef} className="chart" style={{ height }} />
      </div>
    </div>
  );
};

export default CandleStickChart;
