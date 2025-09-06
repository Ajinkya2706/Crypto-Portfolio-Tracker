import { DatabaseHelpers } from '../src/lib/mongodb'

async function testMongoDB() {
  try {
    console.log('🧪 Testing MongoDB connection...')
    
    // Test user creation
    const testUser = await DatabaseHelpers.createUser({
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashedpassword',
      balance: 10000
    })
    console.log('✅ User created:', testUser.id)
    
    // Test user lookup
    const foundUser = await DatabaseHelpers.findUserByEmail('test@example.com')
    console.log('✅ User found:', foundUser?.email)
    
    // Test trade creation
    const testTrade = await DatabaseHelpers.createTrade({
      userId: testUser.id,
      symbol: 'BTC',
      type: 'BUY',
      quantity: 0.1,
      price: 45000,
      total: 4500,
      fee: 4.5
    })
    console.log('✅ Trade created:', testTrade.id)
    
    // Test holding creation
    const testHolding = await DatabaseHelpers.createHolding({
      userId: testUser.id,
      symbol: 'BTC',
      quantity: 0.1,
      avgPrice: 45000
    })
    console.log('✅ Holding created:', testHolding.id)
    
    console.log('🎉 All MongoDB tests passed!')
    
  } catch (error) {
    console.error('❌ MongoDB test failed:', error)
  }
}

testMongoDB()


