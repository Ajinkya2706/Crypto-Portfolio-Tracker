'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, TrendingUp, TrendingDown, DollarSign, BarChart3, Shield, Zap } from 'lucide-react'
import { cryptoAPI } from '@/lib/crypto-api'
import { CryptoPrice } from '@/lib/crypto-api'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [featuredPrices, setFeaturedPrices] = useState<CryptoPrice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])

  useEffect(() => {
    const fetchPrices = async () => {
      setIsLoading(true)
      try {
        const data = await cryptoAPI.getCurrentPrices()
        setFeaturedPrices(data.slice(0, 12)) // Show top 12 cryptos
      } catch (error) {
        setError('Failed to fetch cryptocurrency prices')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrices()
    
    // Refresh prices every 30 seconds
    const interval = setInterval(fetchPrices, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    }).format(price)
  }

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(2)}%`
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
              <h1 className="text-xl font-bold">CryptoPortfolio</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/signin">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Track Your Crypto Portfolio
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Professional-grade cryptocurrency portfolio tracker with mock trading functionality. 
            Start with $10,000 and trade with real-time prices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 py-3">
                Start Trading Now
              </Button>
            </Link>
            <Link href="/signin">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Live Prices Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Live Cryptocurrency Prices</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Real-time prices updated every 30 seconds
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {featuredPrices.map((crypto) => (
                <Card key={crypto.symbol} className="hover:shadow-xl hover:shadow-blue-100 dark:hover:shadow-blue-900/20 transition-all duration-300 hover:scale-105 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-sm font-bold text-white">{crypto.symbol}</span>
                        </div>
                        <div>
                          <CardTitle className="text-lg font-bold">{crypto.symbol}</CardTitle>
                          <CardDescription className="text-sm">
                            {crypto.name}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant={crypto.price_change_percentage_24h >= 0 ? 'success' : 'destructive'}
                        className="border-2"
                      >
                        {crypto.price_change_percentage_24h >= 0 ? (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1" />
                        )}
                        {formatChange(crypto.price_change_percentage_24h)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatPrice(crypto.current_price)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Market Cap: {formatPrice(crypto.market_cap)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose CryptoPortfolio?</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Professional features for serious traders
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Mock Trading</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Start with $10,000 virtual balance and trade with real market prices
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Data</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Live price updates and comprehensive market analytics
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your data is encrypted and never shared with third parties
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast & Reliable</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Built with Next.js 15 and modern web technologies
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Trading?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of traders who trust CryptoPortfolio for their portfolio management
          </p>
          <Link href="/signup">
            <Button size="lg" className="text-lg px-8 py-3">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600 dark:text-gray-300">
            <p>&copy; 2024 CryptoPortfolio. Built with Next.js 15, TypeScript, and Tailwind CSS.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}