'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

interface Holding {
  id: string
  symbol: string
  quantity: number
  averagePrice: number
  currentValue: number
  totalValue: number
  change: number
  changePercentage: number
}

interface PortfolioData {
  totalValue: number
  totalChange: number
  changePercentage: number
  holdings: Holding[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchPortfolio = async () => {
    try {
      const response = await fetch('/api/portfolio')
      const data = await response.json()
      
      if (data.success) {
        setPortfolio(data.data)
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPortfolio()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchPortfolio, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!portfolio) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load portfolio data</p>
      </div>
    )
  }

  const pieData = portfolio.holdings.map((holding, index) => ({
    name: holding.symbol.toUpperCase(),
    value: holding.totalValue,
    color: COLORS[index % COLORS.length]
  }))

  const barData = portfolio.holdings.map(holding => ({
    symbol: holding.symbol.toUpperCase(),
    value: holding.totalValue,
    change: holding.changePercentage
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Portfolio</h1>
        <p className="text-gray-600 dark:text-gray-400">Your cryptocurrency holdings and performance</p>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${portfolio.totalValue.toLocaleString()}</div>
            <p className={`text-xs ${portfolio.changePercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {portfolio.changePercentage >= 0 ? '+' : ''}{portfolio.changePercentage.toFixed(2)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Change</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${portfolio.totalChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${Math.abs(portfolio.totalChange).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {portfolio.totalChange >= 0 ? 'Gain' : 'Loss'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolio.holdings.length}</div>
            <p className="text-xs text-muted-foreground">Active positions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Allocation */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Allocation</CardTitle>
            <CardDescription>Distribution of your holdings</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Holdings Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Holdings Performance</CardTitle>
            <CardDescription>Value and performance by asset</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="symbol" />
                <YAxis />
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Holdings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Holdings Details</CardTitle>
          <CardDescription>Detailed breakdown of your positions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="overflow-x-auto">
              <table className="w-full border-2 border-gray-300 dark:border-gray-600 min-w-[600px]">
              <thead>
                <tr className="border-b-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                  <th className="text-left py-3 px-4 font-bold border-r border-gray-300 dark:border-gray-600">Asset</th>
                  <th className="text-right py-3 px-4 font-bold border-r border-gray-300 dark:border-gray-600">Quantity</th>
                  <th className="text-right py-3 px-4 font-bold border-r border-gray-300 dark:border-gray-600">Avg Price</th>
                  <th className="text-right py-3 px-4 font-bold border-r border-gray-300 dark:border-gray-600">Current Price</th>
                  <th className="text-right py-3 px-4 font-bold border-r border-gray-300 dark:border-gray-600">Total Value</th>
                  <th className="text-right py-3 px-4 font-bold">Change</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.holdings.map((holding) => (
                  <tr key={holding.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-3 px-4 font-bold border-r border-gray-200 dark:border-gray-700">{holding.symbol.toUpperCase()}</td>
                    <td className="text-right py-3 px-4 border-r border-gray-200 dark:border-gray-700">{holding.quantity.toFixed(6)}</td>
                    <td className="text-right py-3 px-4 border-r border-gray-200 dark:border-gray-700">${holding.averagePrice.toFixed(2)}</td>
                    <td className="text-right py-3 px-4 border-r border-gray-200 dark:border-gray-700">${holding.currentValue.toFixed(2)}</td>
                    <td className="text-right py-3 px-4 border-r border-gray-200 dark:border-gray-700 font-bold">${holding.totalValue.toFixed(2)}</td>
                    <td className={`text-right py-3 px-4 font-bold ${holding.changePercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {holding.changePercentage >= 0 ? '+' : ''}{holding.changePercentage.toFixed(2)}%
                    </td>
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