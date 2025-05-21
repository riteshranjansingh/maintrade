# MainTrade

An all-in-one trading application for Indian stock markets.

## Features (Planned)

- Multi-profile management (manage multiple trading accounts)
- Advanced alert system with chart pattern recognition
- Order placement with replication across accounts
- Position monitoring across brokers
- Trading journal with performance analytics
- Customizable watchlists
- Strategy backtesting
- Comprehensive settings

## Technology Stack

- Electron
- React
- TypeScript
- Redux
- TailwindCSS
- Prisma with SQLite

## Development Status

Currently in initial development phase.

## Setup

```bash
# Install dependencies
npm install

# Run in development mode
npm run electron:dev

# Build for production
npm run electron:build
```

## Project Structure

- `src/`: Source code
  - `api/`: Broker API integrations
  - `components/`: Reusable UI components
  - `pages/`: Application pages
  - `services/`: Service layer
  - `store/`: Redux store
- `electron/`: Electron-specific code
- `prisma/`: Database schema

## License

Private, not for redistribution.