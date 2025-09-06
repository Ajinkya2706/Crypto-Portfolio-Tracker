import axios from 'axios'

export const SUPPORTED_CRYPTOS = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'tether', symbol: 'USDT', name: 'Tether' },
  { id: 'usd-coin', symbol: 'USDC', name: 'USD Coin' },
  { id: 'monero', symbol: 'XMR', name: 'Monero' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' },
  { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche' },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink' },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot' },
] as const

export type CryptoSymbol = typeof SUPPORTED_CRYPTOS[number]['symbol']

export interface CryptoPrice {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  total_volume: number
  image: string
  last_updated: string
}

export interface HistoricalPrice {
  timestamp: number
  price: number
}

class CryptoAPI {
  private baseURL = 'https://api.coingecko.com/api/v3'
  private rateLimitDelay = 3000
  private lastRequestTime = 0
  private requestCount = 0
  private maxRequestsPerMinute = 10

  private async rateLimit() {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    
    // Reset counter every minute
    if (timeSinceLastRequest > 60000) {
      this.requestCount = 0
    }
    
    // Check if we've hit the rate limit
    if (this.requestCount >= this.maxRequestsPerMinute) {
      const waitTime = 60000 - timeSinceLastRequest
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime))
        this.requestCount = 0
      }
    }
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest))
    }
    
    this.lastRequestTime = Date.now()
    this.requestCount++
  }

  async getCurrentPrices(): Promise<CryptoPrice[]> {
    await this.rateLimit()
    
    try {
      const ids = SUPPORTED_CRYPTOS.map(crypto => crypto.id).join(',')
      const response = await axios.get(`${this.baseURL}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          ids,
          order: 'market_cap_desc',
          per_page: 100,
          page: 1,
          sparkline: false,
          price_change_percentage: '24h'
        },
        timeout: 10000
      })

      return response.data.map((coin: any) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        current_price: coin.current_price,
        price_change_percentage_24h: coin.price_change_percentage_24h || 0,
        market_cap: coin.market_cap,
        total_volume: coin.total_volume,
        image: coin.image,
        last_updated: coin.last_updated
      }))
    } catch (error: any) {
      console.error('Error fetching current prices:', error)
      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.')
      }
      throw new Error('Failed to fetch cryptocurrency prices')
    }
  }

  async getHistoricalPrices(symbol: string, days: number = 7): Promise<HistoricalPrice[]> {
    await this.rateLimit()
    
    try {
      const crypto = SUPPORTED_CRYPTOS.find(c => c.symbol === symbol)
      if (!crypto) throw new Error(`Unsupported cryptocurrency: ${symbol}`)

      const response = await axios.get(`${this.baseURL}/coins/${crypto.id}/market_chart`, {
        params: {
          vs_currency: 'usd',
          days,
          interval: days <= 1 ? 'hourly' : 'daily'
        },
        timeout: 10000
      })

      return response.data.prices.map(([timestamp, price]: [number, number]) => ({
        timestamp,
        price
      }))
    } catch (error) {
      console.error(`Error fetching historical prices for ${symbol}:`, error)
      throw new Error(`Failed to fetch historical prices for ${symbol}`)
    }
  }

  async getCoinDetails(symbol: string): Promise<CryptoPrice | null> {
    await this.rateLimit()
    
    try {
      const crypto = SUPPORTED_CRYPTOS.find(c => c.symbol === symbol)
      if (!crypto) return null

      const response = await axios.get(`${this.baseURL}/coins/${crypto.id}`, {
        params: {
          localization: false,
          tickers: false,
          market_data: true,
          community_data: false,
          developer_data: false,
          sparkline: false
        },
        timeout: 10000
      })

      const coin = response.data
      return {
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        current_price: coin.market_data.current_price.usd,
        price_change_percentage_24h: coin.market_data.price_change_percentage_24h || 0,
        market_cap: coin.market_data.market_cap.usd,
        total_volume: coin.market_data.total_volume.usd,
        image: coin.image.small,
        last_updated: coin.last_updated
      }
    } catch (error: any) {
      console.error(`Error fetching coin details for ${symbol}:`, error)
      if (error.response?.status === 429) {
        console.log('Rate limited, returning null for coin details')
        return null
      }
      return null
    }
  }
}

export const cryptoAPI = new CryptoAPI()

