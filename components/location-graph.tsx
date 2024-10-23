'use client'

import { FC } from 'react'
import { TrendingUp } from 'lucide-react'
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

export const description = 'A multiple line chart'

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'hsl(var(--chart-1))',
  },
  mobile: {
    label: 'Mobile',
    color: 'hsl(var(--chart-2))',
  },
  test: {
    label: 'Mobile',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig

// Sample data for sensor motion over time
const sampleData = [
  { x: 0.2, y: 1.3, z: 0.8 },
  { x: 0.4, y: 1.0, z: 0.6 },
  { x: 0.7, y: 0.9, z: 0.3 },
  { x: 0.3, y: 1.2, z: 0.5 },
  { x: 0.8, y: 1.1, z: 0.7 },
  { x: 0.5, y: 1.0, z: 0.4 },
]

interface LocationGraphProps {
  graphData: Array<{ x: number; y: number; z: number }>
}

const locationGraph: FC<LocationGraphProps> = ({ graphData = sampleData }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Line Chart - Multiple</CardTitle>
        <CardDescription>
          <div className="flex items-center gap-2 font-medium leading-none">
            graphic visualization of motion sensor data{' '}
            <TrendingUp className="h-4 w-4" />
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={graphData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            {/* <XAxis
              dataKey="timestamp"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            /> */}
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="x"
              type="monotone"
              stroke="var(--color-desktop)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="y"
              type="monotone"
              stroke="var(--color-mobile)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="z"
              type="monotone"
              stroke="var(--color-test)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      {/* <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              graphic visualization of motion sensor data{' '}
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
        </div>
      </CardFooter> */}
    </Card>
  )
}

export default locationGraph
