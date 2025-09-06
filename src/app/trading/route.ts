import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isValidObjectId } from '@/lib/database-helpers'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isValidObjectId(session.user.id)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    const trades = await prisma.trade.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    })

    return NextResponse.json(trades)
  } catch (error) {
    console.error('Error fetching trades:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { symbol, type, quantity, price } = body

    // Validate input
    if (!symbol || !type || !quantity || !price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!['BUY', 'SELL'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid trade type' },
        { status: 400 }
      )
    }

    const total = quantity * price

    // Create trade
    const trade = await prisma.trade.create({
      data: {
        userId: session.user.id,
        symbol,
        type,
        quantity: parseFloat(quantity),
        price: parseFloat(price),
        total,
      }
    })

    // Update user balance and holdings
    await updateUserBalanceAndHoldings(session.user.id, trade)

    return NextResponse.json(trade)
  } catch (error) {
    console.error('Error creating trade:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function updateUserBalanceAndHoldings(userId: string, trade: any) {
  // Get current user
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error('User not found')

  // Update balance
  const newBalance = trade.type === 'BUY' 
    ? user.balance - trade.total
    : user.balance + trade.total

  await prisma.user.update({
    where: { id: userId },
    data: { balance: newBalance }
  })

  // Update holdings
  const existingHolding = await prisma.holding.findFirst({
    where: {
      userId,
      symbol: trade.symbol
    }
  })

  if (trade.type === 'BUY') {
    if (existingHolding) {
      const newQuantity = existingHolding.quantity + trade.quantity
      const newAvgPrice = ((existingHolding.avgPrice * existingHolding.quantity) + trade.total) / newQuantity

      await prisma.holding.update({
        where: { id: existingHolding.id },
        data: {
          quantity: newQuantity,
          avgPrice: newAvgPrice
        }
      })
    } else {
      await prisma.holding.create({
        data: {
          userId,
          symbol: trade.symbol,
          quantity: trade.quantity,
          avgPrice: trade.price
        }
      })
    }
  } else if (trade.type === 'SELL' && existingHolding) {
    const newQuantity = existingHolding.quantity - trade.quantity
    
    if (newQuantity <= 0) {
      await prisma.holding.delete({
        where: { id: existingHolding.id }
      })
    } else {
      await prisma.holding.update({
        where: { id: existingHolding.id },
        data: { quantity: newQuantity }
      })
    }
  }
}