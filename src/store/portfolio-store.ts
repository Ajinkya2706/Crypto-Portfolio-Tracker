import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { Trade, Holding, Portfolio } from '@/types/crypto'
import { CryptoSymbol } from '@/lib/crypto-api'

interface PortfolioState {
  // User data
  balance: number
  holdings: Record<string, Holding>
  trades: Trade[]
  
  // Portfolio calculations
  totalValue: number
  totalProfitLoss: number
  totalProfitLossPercentage: number
  
  // UI state
  isLoading: boolean
  error: string | null
  
  // Actions
  setBalance: (balance: number) => void
  setHoldings: (holdings: Holding[]) => void
  setTrades: (trades: Trade[]) => void
  addTrade: (trade: Trade) => void
  updateHolding: (symbol: CryptoSymbol, holding: Holding) => void
  removeHolding: (symbol: CryptoSymbol) => void
  calculatePortfolioValue: (currentPrices: Record<string, number>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const usePortfolioStore = create<PortfolioState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    balance: 10000, // Starting balance
    holdings: {},
    trades: [],
    totalValue: 10000,
    totalProfitLoss: 0,
    totalProfitLossPercentage: 0,
    isLoading: false,
    error: null,

    // Actions
    setBalance: (balance) => set({ balance }),

    setHoldings: (holdings) => {
      const holdingsMap = holdings.reduce((acc, holding) => {
        acc[holding.symbol] = holding
        return acc
      }, {} as Record<string, Holding>)

      set({ holdings: holdingsMap })
    },

    setTrades: (trades) => set({ trades }),

    addTrade: (trade) => {
      set((state) => ({
        trades: [trade, ...state.trades].slice(0, 50) // Keep last 50 trades
      }))
    },

    updateHolding: (symbol, holding) => {
      set((state) => ({
        holdings: {
          ...state.holdings,
          [symbol]: holding
        }
      }))
    },

    removeHolding: (symbol) => {
      set((state) => {
        const { [symbol]: removed, ...remaining } = state.holdings
        return { holdings: remaining }
      })
    },

    calculatePortfolioValue: (currentPrices) => {
      const { holdings, balance } = get()
      
      let totalValue = balance
      let totalCost = 0
      let totalProfitLoss = 0

      Object.values(holdings).forEach(holding => {
        const currentPrice = currentPrices[holding.symbol] || holding.currentPrice
        const currentValue = holding.quantity * currentPrice
        const costBasis = holding.quantity * holding.avgPrice
        const profitLoss = currentValue - costBasis

        totalValue += currentValue
        totalCost += costBasis
        totalProfitLoss += profitLoss
      })

      const totalProfitLossPercentage = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0

      set({
        totalValue,
        totalProfitLoss,
        totalProfitLossPercentage
      })
    },

    setLoading: (loading) => set({ isLoading: loading }),

    setError: (error) => set({ error, isLoading: false }),

    clearError: () => set({ error: null })
  }))
)

// Selectors
export const selectPortfolio = (state: PortfolioState): Portfolio => {
  const { balance, holdings, totalValue, totalProfitLoss, totalProfitLossPercentage } = state
  
  return {
    balance,
    totalValue,
    totalProfitLoss,
    totalProfitLossPercentage,
    holdings: Object.values(holdings)
  }
}

export const selectHolding = (symbol: CryptoSymbol) => (state: PortfolioState) => {
  return state.holdings[symbol]
}

export const selectRecentTrades = (limit: number = 10) => (state: PortfolioState) => {
  return state.trades.slice(0, limit)
}

export const selectTotalTrades = (state: PortfolioState) => {
  return state.trades.length
}

export const selectBuyTrades = (state: PortfolioState) => {
  return state.trades.filter(trade => trade.type === 'BUY')
}

export const selectSellTrades = (state: PortfolioState) => {
  return state.trades.filter(trade => trade.type === 'SELL')
}

export const selectPortfolioAllocation = (state: PortfolioState) => {
  const { holdings, totalValue } = state
  
  return Object.values(holdings).map(holding => ({
    symbol: holding.symbol,
    percentage: (holding.value / totalValue) * 100,
    value: holding.value
  }))
}


