import { MongoClient, Db, Collection } from 'mongodb'
import { User, Trade, Holding, PriceAlert } from '@/types/database'

// const uri = process.env.DATABASE_URL

// if (!uri) {
//   throw new Error('Please add your MongoDB URI to .env.local')
// }
// const options = {
//   serverSelectionTimeoutMS: 5000,
//   connectTimeoutMS: 10000,
//   maxPoolSize: 10,
//   retryWrites: true,
// }

// let client: MongoClient
// let clientPromise: Promise<MongoClient>

// if (process.env.NODE_ENV === 'development') {
//   // In development mode, use a global variable so that the value
//   // is preserved across module reloads caused by HMR (Hot Module Replacement).
//   const globalWithMongo = global as typeof globalThis & {
//     _mongoClientPromise?: Promise<MongoClient>
//   }

//   if (!globalWithMongo._mongoClientPromise) {
//     client = new MongoClient(uri, options)
//     globalWithMongo._mongoClientPromise = client.connect()
//   }
//   clientPromise = globalWithMongo._mongoClientPromise
// } else {
//   // In production mode, it's best to not use a global variable.
//   client = new MongoClient(uri, options)
//   clientPromise = client.connect()
// }

// // Export a module-scoped MongoClient promise. By doing this in a
// // separate module, the client can be shared across functions.
// export default clientPromise

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

async function getMongoClient() {
  if (typeof window !== 'undefined') {
    throw new Error('MongoDB client cannot be used on the client side');
  }

  const uri = process.env.DATABASE_URL || "mongodb://localhost:27017/crypto-portfolio";
  if (!uri) {
    throw new Error("Please add your DATABASE_URL to .env.local");
  }

  if (process.env.NODE_ENV === "development") {
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>
    }

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
        maxPoolSize: 10,
        retryWrites: true,
      });
      globalWithMongo._mongoClientPromise = client.connect();
    }
    return globalWithMongo._mongoClientPromise;
  } else {
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
      retryWrites: true,
    });
    return client.connect();
  }
}

export default getMongoClient();


// Database and Collections
export async function getDatabase(): Promise<Db> {
  const client = await getMongoClient()
  return client.db('crypto-portfolio')
}

export async function getUsersCollection(): Promise<Collection<User>> {
  const db = await getDatabase()
  return db.collection<User>('users')
}

export async function getTradesCollection(): Promise<Collection<Trade>> {
  const db = await getDatabase()
  return db.collection<Trade>('trades')
}

export async function getHoldingsCollection(): Promise<Collection<Holding>> {
  const db = await getDatabase()
  return db.collection<Holding>('holdings')
}

export async function getPriceAlertsCollection(): Promise<Collection<PriceAlert>> {
  const db = await getDatabase()
  return db.collection<PriceAlert>('price_alerts')
}

// Database helper functions
export class DatabaseHelpers {
  // User operations
  static async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const users = await getUsersCollection()
    const now = new Date()
    
    const result = await users.insertOne({
      ...userData,
      createdAt: now,
      updatedAt: now
    } as any)
    
    return {
      ...userData,
      id: result.insertedId.toString(),
      createdAt: now,
      updatedAt: now
    }
  }

  static async findUserByEmail(email: string): Promise<User | null> {
    const users = await getUsersCollection()
    return await users.findOne({ email })
  }

  static async findUserById(id: string): Promise<User | null> {
    const users = await getUsersCollection()
    const { ObjectId } = await import('mongodb')
    return await users.findOne({ _id: new ObjectId(id) })
  }

  static async updateUserBalance(id: string, balance: number): Promise<void> {
    const users = await getUsersCollection()
    const { ObjectId } = await import('mongodb')
    await users.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          balance,
          updatedAt: new Date()
        }
      }
    )
  }

  // Trade operations
  static async createTrade(tradeData: Omit<Trade, 'id' | 'createdAt'>): Promise<Trade> {
    const trades = await getTradesCollection()
    
    const result = await trades.insertOne({
      ...tradeData,
      createdAt: new Date()
    } as any)
    
    return {
      ...tradeData,
      id: result.insertedId.toString(),
      createdAt: new Date()
    }
  }

  static async getTradesByUserId(userId: string, limit: number = 50): Promise<Trade[]> {
    const trades = await getTradesCollection()
    return await trades
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray()
  }

  // Holding operations
  static async createHolding(holdingData: Omit<Holding, 'id'>): Promise<Holding> {
    const holdings = await getHoldingsCollection()
    
    const result = await holdings.insertOne(holdingData as any)
    
    return {
      ...holdingData,
      id: result.insertedId.toString()
    }
  }

  static async getHoldingsByUserId(userId: string): Promise<Holding[]> {
    const holdings = await getHoldingsCollection()
    return await holdings.find({ userId }).toArray()
  }

  static async updateHolding(id: string, updateData: Partial<Holding>): Promise<void> {
    const holdings = await getHoldingsCollection()
    const { ObjectId } = await import('mongodb')
    await holdings.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )
  }

  static async deleteHolding(id: string): Promise<void> {
    const holdings = await getHoldingsCollection()
    const { ObjectId } = await import('mongodb')
    await holdings.deleteOne({ _id: new ObjectId(id) })
  }

  static async findHoldingByUserAndSymbol(userId: string, symbol: string): Promise<Holding | null> {
    const holdings = await getHoldingsCollection()
    return await holdings.findOne({ userId, symbol })
  }

  // Price Alert operations
  static async createPriceAlert(alertData: Omit<PriceAlert, 'id' | 'createdAt'>): Promise<PriceAlert> {
    const alerts = await getPriceAlertsCollection()
    const alert: PriceAlert = {
      ...alertData,
      id: '', // Will be set by MongoDB
      createdAt: new Date()
    }
    
    const result = await alerts.insertOne(alert as any)
    return { ...alert, id: result.insertedId.toString() }
  }

  static async getPriceAlertsByUserId(userId: string): Promise<PriceAlert[]> {
    const alerts = await getPriceAlertsCollection()
    return await alerts.find({ userId }).toArray()
  }

  static async updatePriceAlert(id: string, updateData: Partial<PriceAlert>): Promise<void> {
    const alerts = await getPriceAlertsCollection()
    const { ObjectId } = await import('mongodb')
    await alerts.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )
  }

  static async deletePriceAlert(id: string): Promise<void> {
    const alerts = await getPriceAlertsCollection()
    const { ObjectId } = await import('mongodb')
    await alerts.deleteOne({ _id: new ObjectId(id) })
  }
}

