import { useColorMode } from "@chakra-ui/react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ChartConfig {
  xAxis: { key: string; label: string };
  yAxes: { key: string; label: string; color: string }[];
}

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
  const { colorMode } = useColorMode();
  if (!tableData || !chartType || !chartConfig) return null;

  const { xAxis, yAxes } = chartConfig;

  const fontSize = 12;
  const fontColor = colorMode === "dark" ? "#ffffff" : "#000000";
  const chartMargin = { top: 20, right: 20, left: 20, bottom: 40 };

  if (chartType === "bar" || chartType === "multiBar") {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={tableData} margin={chartMargin}>
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
        </BarChart>
      </ResponsiveContainer>
    );
  } else if (chartType === "line" || chartType === "multiLine") {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={tableData} margin={chartMargin}>
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
          />
          <Tooltip
            contentStyle={{ fontSize }}
            labelStyle={{ fontSize }}
            itemStyle={{ fontSize }}
          />
          <Legend
            wrapperStyle={{ fontSize, color: fontColor, paddingTop: 40 }}
            verticalAlign="bottom"
          />
          {yAxes.map((yAxis) => (
            <Line
              key={yAxis.key}
              type="monotone"
              dataKey={yAxis.key}
              stroke={yAxis.color}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  } else if (chartType === "pie") {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <PieChart margin={chartMargin}>
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
        </PieChart>
      </ResponsiveContainer>
    );
  }

  return null;
};

export default ChartRenderer;
