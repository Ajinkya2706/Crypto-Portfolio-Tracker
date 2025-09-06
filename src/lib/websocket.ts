import { io, Socket } from 'socket.io-client'

export interface PriceUpdate {
  symbol: string
  price: number
  change24h: number
  timestamp: number
}

export interface WebSocketConfig {
  url: string
  reconnectAttempts?: number
  reconnectDelay?: number
}

class CryptoWebSocket {
  private socket: Socket | null = null
  private subscribers: Map<string, Set<(data: PriceUpdate) => void>> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private isConnected = false

  constructor(private config: WebSocketConfig) {
    this.config = {
      ...config,
      reconnectAttempts: config.reconnectAttempts || this.maxReconnectAttempts,
      reconnectDelay: config.reconnectDelay || this.reconnectDelay
    }
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(this.config.url, {
          transports: ['websocket'],
          timeout: 10000,
          reconnection: true,
          reconnectionAttempts: this.config.reconnectAttempts,
          reconnectionDelay: this.config.reconnectDelay
        })

        this.socket.on('connect', () => {
          console.log('WebSocket connected')
          this.isConnected = true
          this.reconnectAttempts = 0
          this.subscribeToAllSymbols()
          resolve()
        })

        this.socket.on('disconnect', () => {
          console.log('WebSocket disconnected')
          this.isConnected = false
        })

        this.socket.on('reconnect', () => {
          console.log('WebSocket reconnected')
          this.isConnected = true
          this.reconnectAttempts = 0
          this.subscribeToAllSymbols()
        })

        this.socket.on('reconnect_error', (error) => {
          console.error('WebSocket reconnection error:', error)
          this.reconnectAttempts++
        })

        this.socket.on('price_update', (data: PriceUpdate) => {
          this.handlePriceUpdate(data)
        })

        this.socket.on('connect_error', (error) => {
          console.error('WebSocket connection error:', error)
          reject(error)
        })

      } catch (error) {
        console.error('Error creating WebSocket connection:', error)
        reject(error)
      }
    })
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  subscribe(symbol: string, callback: (data: PriceUpdate) => void): () => void {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, new Set())
    }
    
    this.subscribers.get(symbol)!.add(callback)

    // If connected, subscribe to this symbol
    if (this.isConnected && this.socket) {
      this.socket.emit('subscribe', symbol)
    }

    // Return unsubscribe function
    return () => {
      const symbolSubscribers = this.subscribers.get(symbol)
      if (symbolSubscribers) {
        symbolSubscribers.delete(callback)
        if (symbolSubscribers.size === 0) {
          this.subscribers.delete(symbol)
          if (this.isConnected && this.socket) {
            this.socket.emit('unsubscribe', symbol)
          }
        }
      }
    }
  }

  private subscribeToAllSymbols(): void {
    if (this.socket && this.subscribers.size > 0) {
      const symbols = Array.from(this.subscribers.keys())
      this.socket.emit('subscribe_multiple', symbols)
    }
  }

  private handlePriceUpdate(data: PriceUpdate): void {
    const subscribers = this.subscribers.get(data.symbol)
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Error in price update callback:', error)
        }
      })
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected
  }
}

// Binance WebSocket implementation for real-time prices
export class BinanceWebSocket {
  private ws: WebSocket | null = null
  private subscribers: Map<string, Set<(data: PriceUpdate) => void>> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private isConnected = false
  private subscribedSymbols: Set<string> = new Set()

  constructor() {
    this.connect()
  }

  private connect(): void {
    try {
      this.ws = new WebSocket('wss://stream.binance.com:9443/ws/!ticker@arr')
      
      this.ws.onopen = () => {
        console.log('Binance WebSocket connected')
        this.isConnected = true
        this.reconnectAttempts = 0
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handlePriceUpdate(data)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      this.ws.onclose = () => {
        console.log('Binance WebSocket disconnected')
        this.isConnected = false
        this.attemptReconnect()
      }

      this.ws.onerror = (error) => {
        console.error('Binance WebSocket error:', error)
        this.isConnected = false
      }

    } catch (error) {
      console.error('Error creating Binance WebSocket:', error)
      this.attemptReconnect()
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect to Binance WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      
      setTimeout(() => {
        this.connect()
      }, this.reconnectDelay * this.reconnectAttempts)
    } else {
      console.error('Max reconnection attempts reached for Binance WebSocket')
    }
  }

  subscribe(symbol: string, callback: (data: PriceUpdate) => void): () => void {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, new Set())
    }
    
    this.subscribers.get(symbol)!.add(callback)
    this.subscribedSymbols.add(symbol)

    return () => {
      const symbolSubscribers = this.subscribers.get(symbol)
      if (symbolSubscribers) {
        symbolSubscribers.delete(callback)
        if (symbolSubscribers.size === 0) {
          this.subscribers.delete(symbol)
          this.subscribedSymbols.delete(symbol)
        }
      }
    }
  }

  private handlePriceUpdate(data: any[]): void {
    data.forEach(ticker => {
      const symbol = ticker.s.replace('USDT', '')
      const subscribers = this.subscribers.get(symbol)
      
      if (subscribers && this.subscribedSymbols.has(symbol)) {
        const priceUpdate: PriceUpdate = {
          symbol,
          price: parseFloat(ticker.c),
          change24h: parseFloat(ticker.P),
          timestamp: Date.now()
        }
        
        subscribers.forEach(callback => {
          try {
            callback(priceUpdate)
          } catch (error) {
            console.error('Error in price update callback:', error)
          }
        })
      }
    })
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
      this.isConnected = false
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected
  }
}

// Export singleton instances
export const cryptoWebSocket = new CryptoWebSocket({
  url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'
})

export const binanceWebSocket = new BinanceWebSocket()


