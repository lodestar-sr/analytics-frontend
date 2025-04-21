import { useColorMode } from "@chakra-ui/react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChartProps } from "./types";

const BarChartComponent: React.FC<ChartProps> = ({ tableData, chartConfig }) => {
  const { colorMode } = useColorMode();
  const { xAxis, yAxes } = chartConfig;
  
  const fontSize = 12;
  const fontColor = colorMode === "dark" ? "#ffffff" : "#000000";
  const chartMargin = { top: 20, right: 20, left: 20, bottom: 40 };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RechartsBarChart data={tableData} margin={chartMargin}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey={xAxis.key}
          tick={{ fill: fontColor, fontSize }}
          label={{
            value: xAxis.label,
            position: "insideBottom",
            offset: -20,
            fill: fontColor,
            fontSize,
          }}
        />
        <YAxis
          tick={{ fill: fontColor, fontSize }}
          label={{
            value: "Amount ($)",
            angle: -90,
            position: "insideLeft",
            offset: -15,
            fill: fontColor,
            fontSize,
          }}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          contentStyle={{ fontSize }}
          labelStyle={{ fontSize }}
          itemStyle={{ fontSize }}
        />
        <Legend
          wrapperStyle={{ fontSize, color: fontColor, paddingTop: 36 }}
          verticalAlign="bottom"
        />
        {yAxes.map((yAxis) => (
          <Bar key={yAxis.key} dataKey={yAxis.key} fill={yAxis.color} />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default BarChartComponent; 