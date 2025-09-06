import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { CryptoPrice, CryptoSymbol } from '@/lib/crypto-api'
import { PriceUpdate } from '@/lib/websocket'

interface CryptoState {
  // Price data
  prices: Record<string, CryptoPrice>
  priceUpdates: Record<string, PriceUpdate>
  isLoading: boolean
  error: string | null
  lastUpdated: number | null

  // WebSocket connection
  isConnected: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'

  // Actions
  setPrices: (prices: CryptoPrice[]) => void
  updatePrice: (update: PriceUpdate) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setConnectionStatus: (status: CryptoState['connectionStatus']) => void
  clearError: () => void
}

export const useCryptoStore = create<CryptoState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    prices: {},
    priceUpdates: {},
    isLoading: false,
    error: null,
    lastUpdated: null,
    isConnected: false,
    connectionStatus: 'disconnected',

    // Actions
    setPrices: (prices) => {
      const priceMap = prices.reduce((acc, price) => {
        acc[price.symbol] = price
        return acc
      }, {} as Record<string, CryptoPrice>)

      set({
        prices: priceMap,
        lastUpdated: Date.now(),
        error: null
      })
    },

    updatePrice: (update) => {
      set((state) => ({
        priceUpdates: {
          ...state.priceUpdates,
          [update.symbol]: update
        },
        lastUpdated: Date.now()
      }))
    },

    setLoading: (loading) => set({ isLoading: loading }),

    setError: (error) => set({ error, isLoading: false }),

    setConnectionStatus: (status) => {
      set({
        connectionStatus: status,
        isConnected: status === 'connected'
      })
    },

    clearError: () => set({ error: null })
  }))
)

// Selectors
export const selectCryptoPrice = (symbol: CryptoSymbol) => (state: CryptoState) => {
  const price = state.prices[symbol]
  const update = state.priceUpdates[symbol]
  
  if (update && price) {
    return {
      ...price,
      current_price: update.price,
      price_change_percentage_24h: update.change24h
    }
  }
  
  return price
}

export const selectAllPrices = (state: CryptoState) => {
  const { prices, priceUpdates } = state
  
  return Object.keys(prices).map(symbol => {
    const price = prices[symbol]
    const update = priceUpdates[symbol]
    
    if (update) {
      return {
        ...price,
        current_price: update.price,
        price_change_percentage_24h: update.change24h
      }
    }
    
    return price
  })
}

export const selectPriceChange = (symbol: CryptoSymbol) => (state: CryptoState) => {
  const update = state.priceUpdates[symbol]
  return update?.change24h || 0
}

export const selectIsPriceUpdating = (symbol: CryptoSymbol) => (state: CryptoState) => {
  return state.priceUpdates[symbol] !== undefined
}


