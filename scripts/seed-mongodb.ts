import { MongoClient } from 'mongodb'
import bcrypt from 'bcryptjs'

const uri = process.env.DATABASE_URL!
const client = new MongoClient(uri)

async function seedDatabase() {
  try {
    await client.connect()
    console.log('🌱 Connected to MongoDB')

    const db = client.db('crypto-portfolio')

    // Clear existing data
    await db.collection('users').deleteMany({})
    await db.collection('trades').deleteMany({})
    await db.collection('holdings').deleteMany({})
    await db.collection('price_alerts').deleteMany({})
    console.log('🧹 Cleared existing data')

    // Create demo user
    const hashedPassword = await bcrypt.hash('password123', 12)
    
    const demoUser = await db.collection('users').insertOne({
      email: 'demo@cryptoportfolio.com',
      name: 'Demo User',
      password: hashedPassword,
      balance: 10000,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    console.log('✅ Demo user created:', demoUser.insertedId)

    // Create sample trades
    const sampleTrades = [
      {
        userId: demoUser.insertedId.toString(),
        symbol: 'BTC',
        type: 'BUY',
        quantity: 0.1,
        price: 45000,
        total: 4500,
        fee: 4.5,
        createdAt: new Date()
      },
      {
        userId: demoUser.insertedId.toString(),
        symbol: 'ETH',
        type: 'BUY',
        quantity: 2,
        price: 3000,
        total: 6000,
        fee: 6,
        createdAt: new Date()
      },
      {
        userId: demoUser.insertedId.toString(),
        symbol: 'SOL',
        type: 'BUY',
        quantity: 50,
        price: 100,
        total: 5000,
        fee: 5,
        createdAt: new Date()
      }
    ]

    const tradesResult = await db.collection('trades').insertMany(sampleTrades)
    console.log('✅ Sample trades created:', tradesResult.insertedCount)

    // Create corresponding holdings
    const sampleHoldings = [
      {
        userId: demoUser.insertedId.toString(),
        symbol: 'BTC',
        quantity: 0.1,
        avgPrice: 45000
      },
      {
        userId: demoUser.insertedId.toString(),
        symbol: 'ETH',
        quantity: 2,
        avgPrice: 3000
      },
      {
        userId: demoUser.insertedId.toString(),
        symbol: 'SOL',
        quantity: 50,
        avgPrice: 100
      }
    ]

    const holdingsResult = await db.collection('holdings').insertMany(sampleHoldings)
    console.log('✅ Sample holdings created:', holdingsResult.insertedCount)

    // Update user balance to reflect trades
    const totalSpent = sampleTrades.reduce((sum, trade) => sum + trade.total + trade.fee, 0)
    await db.collection('users').updateOne(
      { _id: demoUser.insertedId },
      { 
        $set: { 
          balance: 10000 - totalSpent,
          updatedAt: new Date()
        }
      }
    )

    console.log('✅ User balance updated')
    console.log('🎉 Database seeding completed!')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
  } finally {
    await client.close()
    console.log('🔌 Disconnected from MongoDB')
  }
}

seedDatabase()


