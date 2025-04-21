import { useColorMode } from "@chakra-ui/react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChartProps } from "./types";

const PieChartComponent: React.FC<ChartProps> = ({ tableData, chartConfig }) => {
  const { colorMode } = useColorMode();
  const { xAxis, yAxes } = chartConfig;
  
  const fontSize = 12;
  const fontColor = colorMode === "dark" ? "#ffffff" : "#000000";
  const chartMargin = { top: 20, right: 20, left: 20, bottom: 40 };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RechartsPieChart margin={chartMargin}>
        <Pie
          data={tableData}
          dataKey={yAxes[0].key}
          nameKey={xAxis.key}
          cx="50%"
          cy="50%"
          outerRadius={100}
          fill={yAxes[0].color}
          label={{ fontSize, fill: fontColor }}
        />
        <Tooltip
          contentStyle={{ fontSize }}
          labelStyle={{ fontSize }}
          itemStyle={{ fontSize }}
        />
        <Legend
          wrapperStyle={{ fontSize, color: fontColor, paddingTop: 10 }}
          verticalAlign="bottom"
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};

export default PieChartComponent; 