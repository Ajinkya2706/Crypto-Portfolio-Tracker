import { NextRequest, NextResponse } from 'next/server'
import { cryptoAPI } from '@/lib/crypto-api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')
    const days = parseInt(searchParams.get('days') || '7')

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol parameter is required' },
        { status: 400 }
      )
    }

    if (days < 1 || days > 365) {
      return NextResponse.json(
        { error: 'Days parameter must be between 1 and 365' },
        { status: 400 }
      )
    }

    const historicalData = await cryptoAPI.getHistoricalPrices(symbol, days)

    return NextResponse.json({
      success: true,
      data: {
        symbol,
        days,
        prices: historicalData
      },
      timestamp: Date.now()
    })

  } catch (error) {
    console.error('Error fetching historical data:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch historical data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}


