'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, DollarSign, PieChart, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface CryptoPrice {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
}

interface PortfolioData {
  totalValue: number
  totalChange: number
  changePercentage: number
  holdings: Array<{
    symbol: string
    quantity: number
    value: number
    change: number
  }>
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [prices, setPrices] = useState<CryptoPrice[]>([])
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true)
      const [pricesRes, portfolioRes] = await Promise.all([
        fetch('/api/crypto/prices'),
        fetch('/api/portfolio')
      ])
      
      const pricesData = await pricesRes.json()
      const portfolioData = await portfolioRes.json()
      
      if (pricesData.success) {
        setPrices(pricesData.data)
        if (showToast) toast.success('Data refreshed!')
      } else {
        if (showToast) toast.error('Failed to fetch prices')
      }
      
      if (portfolioData.success) {
        setPortfolio(portfolioData.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      if (showToast) toast.error('Failed to refresh data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Welcome back, {session?.user?.name}!
          </h1>
          <p className="text-muted-foreground">
            Here's your crypto portfolio overview
          </p>
        </div>
        <Button 
          onClick={() => fetchData(true)} 
          disabled={refreshing}
          variant="outline"
          className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 hover:scale-105 border-2"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
          <span className="sm:hidden">{refreshing ? 'Refresh...' : 'Refresh'}</span>
        </Button>
      </div>

      {/* Portfolio Summary */}
      {portfolio && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${portfolio.totalValue.toLocaleString()}</div>
              <p className={`text-xs ${portfolio.changePercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {portfolio.changePercentage >= 0 ? '+' : ''}{portfolio.changePercentage.toFixed(2)}% from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">24h Change</CardTitle>
              {portfolio.changePercentage >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${portfolio.changePercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${Math.abs(portfolio.totalChange).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {portfolio.changePercentage >= 0 ? 'Gain' : 'Loss'} today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Holdings</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{portfolio.holdings.length}</div>
              <p className="text-xs text-muted-foreground">
                Active positions
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Cryptocurrencies */}
      <Card className="border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Top Cryptocurrencies</CardTitle>
          <CardDescription>Live prices and 24h changes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {prices.slice(0, 12).map((crypto) => (
              <div key={crypto.id} className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-lg hover:shadow-blue-100 dark:hover:shadow-blue-900/20 transition-all duration-200 hover:scale-105">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-sm font-bold text-white">{crypto.symbol.toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="font-bold text-lg">{crypto.name}</p>
                    <p className="text-sm text-gray-500">{crypto.symbol.toUpperCase()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">${crypto.current_price.toLocaleString()}</p>
                  <p className={`text-sm font-medium ${crypto.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {crypto.price_change_percentage_24h >= 0 ? '+' : ''}{crypto.price_change_percentage_24h.toFixed(2)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}