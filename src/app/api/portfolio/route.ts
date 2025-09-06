import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { DatabaseHelpers } from '@/lib/mongodb'
import { cryptoAPI } from '@/lib/crypto-api'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await DatabaseHelpers.findUserById(session.user.id)
    const holdings = await DatabaseHelpers.getHoldingsByUserId(session.user.id)
    const trades = await DatabaseHelpers.getTradesByUserId(session.user.id, 50)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get current prices for holdings
    const holdingsWithPrices = await Promise.all(
      holdings.map(async (holding) => {
        try {
          const coinDetails = await cryptoAPI.getCoinDetails(holding.symbol)
          const currentPrice = coinDetails?.current_price || 0
          const value = holding.quantity * currentPrice
          const costBasis = holding.quantity * holding.avgPrice
          const profitLoss = value - costBasis
          const profitLossPercentage = costBasis > 0 ? (profitLoss / costBasis) * 100 : 0

          return {
            symbol: holding.symbol,
            quantity: holding.quantity,
            avgPrice: holding.avgPrice,
            currentPrice,
            value,
            profitLoss,
            profitLossPercentage
          }
        } catch (error) {
          console.error(`Error fetching price for ${holding.symbol}:`, error)
          return {
            symbol: holding.symbol,
            quantity: holding.quantity,
            avgPrice: holding.avgPrice,
            currentPrice: holding.avgPrice,
            value: holding.quantity * holding.avgPrice,
            profitLoss: 0,
            profitLossPercentage: 0
          }
        }
      })
    )

    // Calculate portfolio totals
    const totalHoldingsValue = holdingsWithPrices.reduce((sum, holding) => sum + holding.value, 0)
    const totalValue = user.balance + totalHoldingsValue
    const totalCostBasis = holdingsWithPrices.reduce((sum, holding) => sum + (holding.quantity * holding.avgPrice), 0)
    const totalProfitLoss = holdingsWithPrices.reduce((sum, holding) => sum + holding.profitLoss, 0)
    const totalProfitLossPercentage = totalCostBasis > 0 ? (totalProfitLoss / totalCostBasis) * 100 : 0

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          balance: user.balance
        },
        totalValue,
        totalChange: totalProfitLoss,
        changePercentage: totalProfitLossPercentage,
        holdings: holdingsWithPrices.map(h => ({
          id: h.symbol,
          symbol: h.symbol,
          quantity: h.quantity,
          averagePrice: h.avgPrice,
          currentValue: h.currentPrice,
          totalValue: h.value,
          change: h.profitLoss,
          changePercentage: h.profitLossPercentage
        })),
        trades: trades
      },
      timestamp: Date.now()
    })

  } catch (error) {
    console.error('Error fetching portfolio:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch portfolio data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
