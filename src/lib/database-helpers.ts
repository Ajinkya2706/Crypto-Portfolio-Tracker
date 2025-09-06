import { prisma } from './prisma'
import { ObjectId } from 'mongodb'

// Helper to validate ObjectId
export function isValidObjectId(id: string): boolean {
  return ObjectId.isValid(id)
}

// User operations
export async function getUserById(id: string) {
  if (!isValidObjectId(id)) return null
  
  return await prisma.user.findUnique({
    where: { id },
    include: {
      holdings: true,
      trades: {
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  })
}

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
    include: {
      holdings: true
    }
  })
}

// Trading operations
export async function createTrade(data: {
  userId: string
  symbol: string
  type: 'BUY' | 'SELL'
  quantity: number
  price: number
  total: number
}) {
  return await prisma.trade.create({
    data,
    include: {
      user: true
    }
  })
}

// Holdings operations
export async function updateOrCreateHolding(data: {
  userId: string
  symbol: string
  quantity: number
  avgPrice: number
}) {
  return await prisma.holding.upsert({
    where: {
      userId_symbol: {
        userId: data.userId,
        symbol: data.symbol
      }
    },
    update: {
      quantity: data.quantity,
      avgPrice: data.avgPrice
    },
    create: data
  })
}

// Price alerts operations
export async function createPriceAlert(data: {
  userId: string
  symbol: string
  targetPrice: number
  condition: 'ABOVE' | 'BELOW'
}) {
  return await prisma.priceAlert.create({
    data
  })
}

export async function getActivePriceAlerts() {
  return await prisma.priceAlert.findMany({
    where: {
      isActive: true,
      triggered: false
    },
    include: {
      user: true
    }
  })
}