'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TrendingUp, TrendingDown, DollarSign, Wallet, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface CryptoPrice {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
}

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

interface User {
  id: string
  balance: number
}

export default function TradingPage() {
  const { data: session } = useSession()
  const [prices, setPrices] = useState<CryptoPrice[]>([])
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [trading, setTrading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  
  // Trade form state
  const [selectedCrypto, setSelectedCrypto] = useState('')
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState(0)

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
        if (showToast) toast.success('Prices updated!')
      } else {
        if (showToast) toast.error('Failed to fetch prices')
      }
      
      if (portfolioData.success) {
        setHoldings(portfolioData.data.holdings || [])
        setUser(portfolioData.data.user)
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
  }, [])

  const handleCryptoSelect = (cryptoId: string) => {
    setSelectedCrypto(cryptoId)
    const crypto = prices.find(p => p.id === cryptoId)
    if (crypto) {
      setPrice(crypto.current_price)
    }
  }

  const executeTrade = async () => {
    if (!selectedCrypto || !quantity || !user) return

    const crypto = prices.find(p => p.id === selectedCrypto)
    if (!crypto) return

    const qty = parseFloat(quantity)
    const total = qty * price
    const fee = total * 0.001

    if (tradeType === 'BUY' && (total + fee) > user.balance) {
      toast.error('Insufficient balance', `You need $${(total + fee).toFixed(2)} but only have $${user.balance.toFixed(2)}`)
      return
    }

    if (tradeType === 'SELL') {
      const holding = holdings.find(h => h.symbol.toLowerCase() === crypto.symbol.toLowerCase())
      if (!holding) {
        toast.error('No holdings', `You don't have any ${crypto.symbol.toUpperCase()} to sell`)
        return
      }
      if (holding.quantity < qty) {
        toast.error('Insufficient holdings', `You only have ${holding.quantity.toFixed(6)} ${crypto.symbol.toUpperCase()}`)
        return
      }
    }

    setTrading(true)

    try {
      const response = await fetch('/api/trading/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: crypto.symbol,
          type: tradeType,
          quantity: qty,
          price: price
        })
      })

      const result = await response.json()
      
      if (result.success) {
        // Refresh data
        const portfolioRes = await fetch('/api/portfolio')
        const portfolioData = await portfolioRes.json()
        
        if (portfolioData.success) {
          setHoldings(portfolioData.data.holdings || [])
          setUser(portfolioData.data.user)
        }

        setSelectedCrypto('')
        setQuantity('')
        setPrice(0)
        
        toast.success('Trade executed!', `${tradeType} ${qty} ${crypto.symbol.toUpperCase()} at $${price.toFixed(2)}`)
      } else {
        toast.error('Trade failed', result.error || 'Unknown error')
      }
    } catch (error) {
      console.error('Trade error:', error)
      toast.error('Trade failed', 'Network error occurred')
    } finally {
      setTrading(false)
    }
  }

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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Trading</h1>
          <p className="text-muted-foreground">Execute mock trades with real-time prices</p>
        </div>
        <Button 
          onClick={() => fetchData(true)} 
          disabled={refreshing}
          variant="outline"
          className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 hover:scale-105 border-2"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh Prices'}</span>
          <span className="sm:hidden">{refreshing ? 'Refresh...' : 'Refresh'}</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Trading Form */}
        <Card className="border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-xl hover:shadow-blue-100 dark:hover:shadow-blue-900/20">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Execute Trade</CardTitle>
            <CardDescription>Buy or sell cryptocurrencies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Button
                variant={tradeType === 'BUY' ? 'default' : 'outline'}
                onClick={() => setTradeType('BUY')}
                className={`flex-1 transition-all duration-200 hover:scale-105 ${
                  tradeType === 'BUY' 
                    ? 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200 dark:shadow-green-900/50' 
                    : 'hover:bg-green-50 dark:hover:bg-green-900/20'
                }`}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Buy
              </Button>
              <Button
                variant={tradeType === 'SELL' ? 'default' : 'outline'}
                onClick={() => setTradeType('SELL')}
                className={`flex-1 transition-all duration-200 hover:scale-105 ${
                  tradeType === 'SELL' 
                    ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200 dark:shadow-red-900/50' 
                    : 'hover:bg-red-50 dark:hover:bg-red-900/20'
                }`}
              >
                <TrendingDown className="h-4 w-4 mr-2" />
                Sell
              </Button>
            </div>

            <div>
              <Label htmlFor="crypto" className="text-sm font-medium">Cryptocurrency</Label>
              <Select value={selectedCrypto} onValueChange={handleCryptoSelect}>
                <SelectTrigger className="w-full border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                  <SelectValue placeholder="Select cryptocurrency" />
                </SelectTrigger>
                <SelectContent className="border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                  {prices.map((crypto) => (
                    <SelectItem key={crypto.id} value={crypto.id} className="hover:bg-blue-50 dark:hover:bg-blue-900/20">
                      {crypto.name} ({crypto.symbol.toUpperCase()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                step="0.000001"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
              />
            </div>

            <div>
              <Label htmlFor="price">Price per unit</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value))}
                placeholder="Price per unit"
              />
            </div>

            {selectedCrypto && quantity && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Total:</span>
                  <span>${(parseFloat(quantity) * price).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Fee (0.1%):</span>
                  <span>${(parseFloat(quantity) * price * 0.001).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total Cost:</span>
                  <span>${(parseFloat(quantity) * price * 1.001).toFixed(2)}</span>
                </div>
              </div>
            )}

            <Button 
              onClick={executeTrade} 
              disabled={trading || !selectedCrypto || !quantity}
              className="w-full bg-blue-600 hover:bg-blue-700 border-2 border-blue-700 dark:border-blue-500 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-blue-200 dark:hover:shadow-blue-900/50 disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              {trading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Executing...
                </div>
              ) : (
                `${tradeType} ${selectedCrypto ? prices.find(p => p.id === selectedCrypto)?.symbol.toUpperCase() : ''}`
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Current Holdings */}
        <Card className="border-2 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle>Current Holdings</CardTitle>
            <CardDescription>Your cryptocurrency positions</CardDescription>
          </CardHeader>
          <CardContent>
            {holdings.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No holdings yet</p>
            ) : (
              <div className="space-y-3">
                {holdings.map((holding) => (
                  <div key={holding.id} className="flex items-center justify-between p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div>
                      <p className="font-bold text-lg">{holding.symbol.toUpperCase()}</p>
                      <p className="text-sm text-gray-500">{holding.quantity.toFixed(6)} units</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">${holding.totalValue.toFixed(2)}</p>
                      <p className={`text-sm font-medium ${holding.changePercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {holding.changePercentage >= 0 ? '+' : ''}{holding.changePercentage.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Balance */}
      {user && (
        <Card className="border-2 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wallet className="h-6 w-6 text-blue-600" />
                <span className="text-lg font-bold">Available Balance</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">${user.balance.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Starting: $10,000</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}