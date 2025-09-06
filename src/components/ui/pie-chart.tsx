import * as React from "react"
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

export interface PieChartProps {
  data: Array<{
    name: string
    value: number
    color?: string
  }>
  colors?: string[]
  className?: string
}

export function PieChart({ data, colors = [], className }: PieChartProps) {
  const defaultColors = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff'
  ]
  
  const chartColors = colors.length > 0 ? colors : defaultColors

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Value']} />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  )
}


