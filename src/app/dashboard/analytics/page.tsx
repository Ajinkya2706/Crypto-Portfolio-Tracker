'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

interface Trade {
  id: string
  symbol: string
  type: 'BUY' | 'SELL'
  quantity: number
  price: number
  total: number
  fee: number
  createdAt: string
}

interface AnalyticsData {
  trades: Trade[]
  totalTrades: number
  totalVolume: number
  profitLoss: number
  winRate: number
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/portfolio')
        const data = await response.json()
        
        if (data.success) {
          const trades = data.data.trades || []
          const totalTrades = trades.length
          const totalVolume = trades.reduce((sum: number, trade: Trade) => sum + trade.total, 0)
          const profitLoss = trades.reduce((sum: number, trade: Trade) => {
            return sum + (trade.type === 'BUY' ? -trade.total : trade.total)
          }, 0)
          const winRate = totalTrades > 0 ? (trades.filter((t: Trade) => t.type === 'SELL').length / totalTrades) * 100 : 0

          setAnalytics({
            trades,
            totalTrades,
            totalVolume,
            profitLoss,
            winRate
          })
        }
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load analytics data</p>
      </div>
    )
  }

  // Prepare chart data
  const chartData = analytics.trades
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((trade, index) => ({
      date: new Date(trade.createdAt).toLocaleDateString(),
      cumulative: analytics.trades
        .slice(0, index + 1)
        .reduce((sum, t) => sum + (t.type === 'BUY' ? -t.total : t.total), 0)
    }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400">Trading performance and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalTrades}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.totalVolume.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Traded amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${analytics.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${Math.abs(analytics.profitLoss).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.profitLoss >= 0 ? 'Profit' : 'Loss'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.winRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Sell trades</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Performance</CardTitle>
          <CardDescription>Cumulative profit/loss over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'P&L']} />
              <Area 
                type="monotone" 
                dataKey="cumulative" 
                stroke="#8884d8" 
                fill="#8884d8" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Trades */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Trades</CardTitle>
          <CardDescription>Your latest trading activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="overflow-x-auto">
              <table className="w-full border-2 border-gray-300 dark:border-gray-600 min-w-[600px]">
              <thead>
                <tr className="border-b-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                  <th className="text-left py-3 px-4 font-bold border-r border-gray-300 dark:border-gray-600">Date</th>
                  <th className="text-left py-3 px-4 font-bold border-r border-gray-300 dark:border-gray-600">Symbol</th>
                  <th className="text-left py-3 px-4 font-bold border-r border-gray-300 dark:border-gray-600">Type</th>
                  <th className="text-right py-3 px-4 font-bold border-r border-gray-300 dark:border-gray-600">Quantity</th>
                  <th className="text-right py-3 px-4 font-bold border-r border-gray-300 dark:border-gray-600">Price</th>
                  <th className="text-right py-3 px-4 font-bold">Total</th>
                </tr>
              </thead>
              <tbody>
                {analytics.trades.slice(-10).reverse().map((trade) => (
                  <tr key={trade.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-3 px-4 border-r border-gray-200 dark:border-gray-700">{new Date(trade.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-bold border-r border-gray-200 dark:border-gray-700">{trade.symbol.toUpperCase()}</td>
                    <td className="py-3 px-4 border-r border-gray-200 dark:border-gray-700">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${
                        trade.type === 'BUY' 
                          ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-600' 
                          : 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-600'
                      }`}>
                        {trade.type}
                      </span>
                    </td>
                    <td className="text-right py-3 px-4 border-r border-gray-200 dark:border-gray-700">{trade.quantity.toFixed(6)}</td>
                    <td className="text-right py-3 px-4 border-r border-gray-200 dark:border-gray-700">${trade.price.toFixed(2)}</td>
                    <td className="text-right py-3 px-4 font-bold">${trade.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}