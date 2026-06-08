import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ChartPoint } from '../../types';

interface Series {
  dataKey: string;
  name: string;
  color: string;
}

interface TemperatureProfileChartProps {
  data: ChartPoint[];
  series: Series[];
  xLabel: string;
  yLabel: string;
}

export function TemperatureProfileChart({ data, series, xLabel, yLabel }: TemperatureProfileChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 12 }}>
          <CartesianGrid stroke="rgba(148, 163, 184, 0.24)" strokeDasharray="4 4" />
          <XAxis
            dataKey="label"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            label={{ value: xLabel, position: 'insideBottom', fill: '#94a3b8', dy: 12 }}
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            label={{ value: yLabel, angle: -90, position: 'insideLeft', fill: '#94a3b8', dy: 36 }}
          />
          <Tooltip
            contentStyle={{
              background: '#0f172a',
              border: '1px solid rgba(148, 163, 184, 0.35)',
              borderRadius: 8,
              color: '#f1f5f9',
            }}
          />
          {series.map((item) => (
            <Line
              key={item.dataKey}
              type="monotone"
              dataKey={item.dataKey}
              name={item.name}
              stroke={item.color}
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
