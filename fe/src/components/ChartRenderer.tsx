import { ChartConfig } from "../utils/types.ts";
import BarChartComponent from "./charts/BarChart";
import LineChartComponent from "./charts/LineChart";
import PieChartComponent from "./charts/PieChart";

interface ChartRendererProps {
  tableData?: any[];
  chartType?: string;
  chartConfig?: ChartConfig;
}

const ChartRenderer: React.FC<ChartRendererProps> = ({
  tableData,
  chartType,
  chartConfig,
}) => {
  if (!tableData || !chartType || !chartConfig) return null;

  const chartComponents = {
    bar: BarChartComponent,
    multiBar: BarChartComponent,
    line: LineChartComponent,
    multiLine: LineChartComponent,
    pie: PieChartComponent,
  };

  const ChartComponent = chartComponents[chartType as keyof typeof chartComponents];
  
  if (!ChartComponent) return null;

  return <ChartComponent tableData={tableData} chartConfig={chartConfig} />;
};

export default ChartRenderer;
