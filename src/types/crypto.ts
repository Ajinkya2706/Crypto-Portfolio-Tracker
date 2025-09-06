export interface CryptoCoin {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  volume_24h: number
  image: string
}

export interface Trade {
  id: string
  symbol: string
  type: 'BUY' | 'SELL'
  quantity: number
  price: number
  total: number
  createdAt: Date
}

export interface Holding {
  symbol: string
  quantity: number
  avgPrice: number
  currentPrice: number
  value: number
  profitLoss: number
  profitLossPercentage: number
}

export interface Portfolio {
  totalValue: number
  totalProfitLoss: number
  totalProfitLossPercentage: number
  balance: number
  holdings: Holding[]
}