# 🚀 CryptoPortfolio Setup Guide

## Quick Setup Instructions

Follow these steps to get your crypto portfolio tracker running:

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create a `.env.local` file in the root directory with the following content:

```env
# Database - Replace with your MongoDB connection string
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/crypto-portfolio?retryWrites=true&w=majority"

# NextAuth.js - Generate a random secret key
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Crypto APIs (these are already configured)
COINGECKO_API_URL="https://api.coingecko.com/api/v3"
BINANCE_WS_URL="wss://stream.binance.com:9443/ws/"
```

### 3. Set Up Database
```bash
# Seed with sample data (optional)
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Open Your Browser
Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Demo Account
- **Email**: demo@cryptoportfolio.com
- **Password**: password123

## 📱 Features Available

### ✅ Completed Features
- **Authentication System**: Sign up, sign in, secure sessions
- **Real-time Crypto Prices**: Live updates from CoinGecko API
- **Mock Trading**: Buy/sell with $10,000 starting balance
- **Portfolio Management**: Track holdings and P&L
- **Advanced Analytics**: Charts and performance metrics
- **Responsive Design**: Mobile-first with Tailwind CSS
- **Dark Mode**: System preference detection
- **Professional UI**: Shadcn/UI components

### 🏗️ Architecture
- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS + Shadcn/UI
- **State Management**: Zustand stores
- **Database**: MongoDB + Prisma ORM
- **Authentication**: NextAuth.js v5
- **Charts**: Recharts for data visualization
- **APIs**: CoinGecko (primary), Binance WebSocket (real-time)

## 🚀 Deployment Options

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Manual Deployment
```bash
npm run build
npm run start
```

## 🔧 Available Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:seed      # Seed database with sample data
```

## 🎨 Customization

### Adding New Cryptocurrencies
1. Update `SUPPORTED_CRYPTOS` in `src/lib/crypto-api.ts`
2. Add new crypto to CoinGecko API calls
3. Update UI components as needed

### Styling Changes
- Modify `src/app/globals.css` for global styles
- Update Tailwind config in `tailwind.config.js`
- Customize Shadcn/UI components in `src/components/ui/`

### Adding New Features
- Create new API routes in `src/app/api/`
- Add new pages in `src/app/`
- Update Zustand stores for state management

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check your MongoDB connection string
   - Ensure database is accessible
   - Run `npm run db:push` to sync schema

2. **Authentication Issues**
   - Verify `NEXTAUTH_SECRET` is set
   - Check `NEXTAUTH_URL` matches your domain

3. **Crypto API Errors**
   - CoinGecko has rate limits (10-50 calls/minute)
   - Check internet connection
   - Verify API endpoints are accessible

4. **Build Errors**
   - Run `npm run lint` to check for errors
   - Ensure all dependencies are installed
   - Check TypeScript configuration

## 📞 Support

If you encounter any issues:
1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure database is properly configured
4. Check network connectivity for API calls

## 🎉 You're Ready!

Your professional crypto portfolio tracker is now ready to use! Start trading with real market prices and track your portfolio performance.

---

**Built with Next.js 15, TypeScript, and modern web technologies** 🚀
