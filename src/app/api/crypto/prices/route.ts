import { NextRequest, NextResponse } from 'next/server'
import { cryptoAPI } from '@/lib/crypto-api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')
    const fallback = searchParams.get('fallback') === 'true'

    let prices

    if (symbol) {
      // Get specific coin details
      const coinDetails = await cryptoAPI.getCoinDetails(symbol)
      if (!coinDetails) {
        return NextResponse.json(
          { error: 'Cryptocurrency not found' },
          { status: 404 }
        )
      }
      prices = [coinDetails]
    } else {
      // Get all supported cryptocurrencies
      try {
        prices = await cryptoAPI.getCurrentPrices()
      } catch (error) {
        throw error
      }
    }

    return NextResponse.json({
      success: true,
      data: prices,
      timestamp: Date.now()
    })

  } catch (error) {
    console.error('Error fetching crypto prices:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch cryptocurrency prices',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { symbols, fallback = false } = body

    if (!symbols || !Array.isArray(symbols)) {
      return NextResponse.json(
        { error: 'Symbols array is required' },
        { status: 400 }
      )
    }

    const prices = []
    
    for (const symbol of symbols) {
      try {
        const coinDetails = await cryptoAPI.getCoinDetails(symbol)
        if (coinDetails) {
          prices.push(coinDetails)
        }
      } catch (error) {
        console.error(`Error fetching price for ${symbol}:`, error)
        // Continue with other symbols
      }
    }

    return NextResponse.json({
      success: true,
      data: prices,
      timestamp: Date.now()
    })

  } catch (error) {
    console.error('Error fetching multiple crypto prices:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch cryptocurrency prices',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
