import { useEffect, useRef, useCallback } from 'react';
import * as echarts from 'echarts/core';
import { LineChart, BarChart, RadarChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  RadarComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { ComposeOption } from 'echarts/core';
import type { LineSeriesOption, BarSeriesOption, RadarSeriesOption } from 'echarts/charts';
import type {
  GridComponentOption,
  TooltipComponentOption,
  LegendComponentOption,
  TitleComponentOption,
  RadarComponentOption,
} from 'echarts/components';

echarts.use([
  LineChart,
  BarChart,
  RadarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  RadarComponent,
  CanvasRenderer,
]);

export type EChartsOption = ComposeOption<
  | LineSeriesOption
  | BarSeriesOption
  | RadarSeriesOption
  | GridComponentOption
  | TooltipComponentOption
  | LegendComponentOption
  | TitleComponentOption
  | RadarComponentOption
>;

type Props = {
  option: EChartsOption;
  className?: string;
  style?: React.CSSProperties;
  onEvents?: Record<string, (params: unknown) => void>;
};

export function ReactECharts({ option, className, style, onEvents }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  const onEventsRef = useRef(onEvents);
  onEventsRef.current = onEvents;

  const stableHandler = useCallback((eventName: string) => (params: unknown) => {
    onEventsRef.current?.[eventName]?.(params);
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current, undefined, { renderer: 'canvas' });
    chartRef.current = chart;
    chart.on('click', stableHandler('click'));
    const onResize = () => chart.resize();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      chart.dispose();
      chartRef.current = null;
    };
  }, [stableHandler]);

  useEffect(() => {
    chartRef.current?.setOption(option, true);
  }, [option]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ width: '100%', minHeight: 240, ...style }}
      role="img"
      aria-hidden
    />
  );
}
