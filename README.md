# CryptoPortfolio Tracker 🚀

A professional-grade cryptocurrency portfolio tracker with mock trading functionality built with Next.js 15, TypeScript, and modern web technologies.

## ✨ Features

### Core Functionality
- **Real-time Crypto Prices**: Live price updates from CoinGecko API
- **Mock Trading**: Execute trades with $10,000 starting balance
- **Portfolio Management**: Track holdings, P&L, and performance
- **Advanced Analytics**: Charts, metrics, and portfolio insights
- **Authentication**: Secure user authentication with NextAuth.js
- **Responsive Design**: Mobile-first design with Tailwind CSS

### Supported Cryptocurrencies
- Bitcoin (BTC)
- Ethereum (ETH)
- Tether (USDT)
- USD Coin (USDC)
- Monero (XMR)
- Solana (SOL)

### Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Shadcn/UI components
- **State Management**: Zustand
- **Database**: MongoDB with Prisma ORM
- **Authentication**: NextAuth.js v5
- **Charts**: Recharts
- **APIs**: CoinGecko API, Binance WebSocket
- **Deployment**: Vercel-ready

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB database (local or cloud)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd crypto-portfolio-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your values:
   ```env
   # Database
   DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/crypto-portfolio?retryWrites=true&w=majority"
   
   # NextAuth.js
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Crypto APIs
   COINGECKO_API_URL="https://api.coingecko.com/api/v3"
   BINANCE_WS_URL="wss://stream.binance.com:9443/ws/"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed with sample data
   npx prisma db seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Demo Account

Use these credentials to explore the application:
- **Email**: demo@cryptoportfolio.com
- **Password**: password123

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js 15 app directory
│   ├── (auth)/            # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   ├── api/              # API routes
│   └── globals.css       # Global styles
├── components/           # Reusable components
│   ├── ui/              # Shadcn/UI components
│   ├── dashboard/       # Dashboard-specific components
│   └── providers.tsx    # Context providers
├── lib/                 # Utility functions
│   ├── auth.ts          # NextAuth configuration
│   ├── crypto-api.ts    # Crypto API integration
│   ├── websocket.ts     # WebSocket handling
│   └── utils.ts         # Utility functions
├── store/               # Zustand stores
│   ├── crypto-store.ts  # Crypto price state
│   └── portfolio-store.ts # Portfolio state
└── types/               # TypeScript definitions
    ├── crypto.ts        # Crypto-related types
    └── database.ts      # Database types
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/auth/signout` - User logout

### Crypto Data
- `GET /api/crypto/prices` - Get current crypto prices
- `GET /api/crypto/historical` - Get historical price data

### Trading
- `POST /api/trading/trade` - Execute a trade
- `GET /api/portfolio` - Get portfolio data

## 🎨 UI Components

Built with Shadcn/UI components:
- Button, Input, Label, Card
- Alert, Badge, Select
- Charts (PieChart, LineChart, AreaChart)
- Responsive design with Tailwind CSS

## 📊 Features Overview

### Dashboard
- Portfolio summary with key metrics
- Live crypto price cards
- Quick action buttons
- Recent trades overview

### Trading Interface
- Real-time price updates
- Buy/Sell order execution
- Trade validation and confirmation
- Fee calculation (0.1% trading fee)

### Portfolio Management
- Detailed holdings breakdown
- P&L tracking with percentages
- Portfolio allocation charts
- Performance analytics

### Analytics
- Portfolio performance charts
- Risk metrics (Sharpe ratio)
- Trading activity summary
- Asset allocation visualization

## 🔒 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Protected API routes
- Input validation with Zod
- SQL injection protection with Prisma

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Set environment variables in Vercel dashboard**
3. **Deploy automatically on push**

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm run start
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [CoinGecko API](https://www.coingecko.com/en/api) for cryptocurrency data
- [Binance WebSocket](https://binance-docs.github.io/apidocs/spot/en/) for real-time prices
- [Shadcn/UI](https://ui.shadcn.com/) for beautiful components
- [Next.js](https://nextjs.org/) for the amazing framework
- [Prisma](https://www.prisma.io/) for database management

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the documentation
- Contact the development team

---

**Built with ❤️ using Next.js 15, TypeScript, and modern web technologies**