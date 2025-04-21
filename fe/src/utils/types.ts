export interface ChartConfig {
  xAxis: { key: string; label: string };
  yAxes: { key: string; label: string; color: string }[];
}

export interface ChartProps {
  tableData: any[];
  chartConfig: ChartConfig;
} 