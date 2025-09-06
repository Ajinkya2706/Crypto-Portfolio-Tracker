import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { DatabaseHelpers } from '@/lib/mongodb'
import { z } from 'zod'
import { cryptoAPI } from '@/lib/crypto-api'

const tradeSchema = z.object({
  symbol: z.string().min(1),
  type: z.enum(['BUY', 'SELL']),
  quantity: z.number().positive(),
  price: z.number().positive().optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { symbol, type, quantity, price } = tradeSchema.parse(body)

    // Get current price if not provided
    let currentPrice = price
    if (!currentPrice) {
      const coinDetails = await cryptoAPI.getCoinDetails(symbol)
      if (!coinDetails) {
        return NextResponse.json(
          { error: 'Cryptocurrency not found' },
          { status: 404 }
        )
      }
      currentPrice = coinDetails.current_price
    }

    const total = quantity * currentPrice
    const fee = total * 0.001 // 0.1% trading fee

    // Get user data
    const user = await DatabaseHelpers.findUserById(session.user.id)
    const holdings = await DatabaseHelpers.getHoldingsByUserId(session.user.id)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Validate trade
    if (type === 'BUY') {
      if (user.balance < total + fee) {
        return NextResponse.json(
          { error: 'Insufficient balance' },
          { status: 400 }
        )
      }
    } else if (type === 'SELL') {
      const holding = holdings.find(h => h.symbol === symbol)
      if (!holding || holding.quantity < quantity) {
        return NextResponse.json(
          { error: 'Insufficient holdings' },
          { status: 400 }
        )
      }
    }

    // Execute trade
    try {
      // Create trade record
      const trade = await DatabaseHelpers.createTrade({
        userId: user._id?.toString() || user.id,
        symbol,
        type,
        quantity,
        price: currentPrice,
        total,
        fee
      })

      // Update user balance
      const balanceChange = type === 'BUY' ? -(total + fee) : (total - fee)
      const newBalance = user.balance + balanceChange
      await DatabaseHelpers.updateUserBalance(user._id?.toString() || user.id, newBalance)
      
      console.log(`Balance update: ${type} ${quantity} ${symbol} at $${currentPrice}`)
      console.log(`Old balance: $${user.balance}, Change: $${balanceChange}, New balance: $${newBalance}`)

      // Update or create holding
      const existingHolding = holdings.find(h => h.symbol.toLowerCase() === symbol.toLowerCase())
      
      if (type === 'BUY') {
        if (existingHolding) {
          // Update existing holding
          const newQuantity = existingHolding.quantity + quantity
          const newAvgPrice = ((existingHolding.quantity * existingHolding.avgPrice) + total) / newQuantity
          
          await DatabaseHelpers.updateHolding(existingHolding.id, {
            quantity: newQuantity,
            avgPrice: newAvgPrice
          })
        } else {
          // Create new holding
          await DatabaseHelpers.createHolding({
            userId: user._id?.toString() || user.id,
            symbol: symbol.toUpperCase(),
            quantity,
            avgPrice: currentPrice
          })
        }
      } else {
        // SELL transaction
        if (!existingHolding) {
          throw new Error(`No holdings found for ${symbol}`)
        }
        
        const newQuantity = existingHolding.quantity - quantity
        if (newQuantity > 0) {
          await DatabaseHelpers.updateHolding(existingHolding.id, {
            quantity: newQuantity
          })
        } else {
          await DatabaseHelpers.deleteHolding(existingHolding.id)
        }
      }

      return NextResponse.json({
        success: true,
        data: trade,
        message: `${type} order executed successfully`
      })
    } catch (error) {
      console.error('Error executing trade:', error)
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to execute trade',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error executing trade:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid trade data',
          details: error.errors
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to execute trade',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
