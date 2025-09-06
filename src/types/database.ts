// MongoDB ObjectId type support
export type ObjectId = string;

export interface User {
  id: ObjectId;
  email: string;
  name?: string;
  password: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Trade {
  id: ObjectId;
  userId: ObjectId;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  total: number;
  fee: number;
  createdAt: Date;
}

export interface Holding {
  id: ObjectId;
  userId: ObjectId;
  symbol: string;
  quantity: number;
  avgPrice: number;
}

export interface PriceAlert {
  id: ObjectId;
  userId: ObjectId;
  symbol: string;
  targetPrice: number;
  condition: 'ABOVE' | 'BELOW';
  isActive: boolean;
  triggered: boolean;
  createdAt: Date;
}