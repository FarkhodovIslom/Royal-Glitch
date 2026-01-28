# Royal Glitch 🎭

> A dark, atmospheric multiplayer card battler built for Global Game Jam 2026.  
> Theme: **MASK**

## 🎮 Game Overview

Royal Glitch adapts the classic Hearts card game into a tense, underground gambling experience where players hide behind masks and compete in a **Sudden Death elimination tournament** with progressive phases until only one winner remains.

### Core Mechanics
- **4 players enter, 1 winner emerges** through 3 progressive phases
- **Integrity System**: Start with 100% HP, lose integrity by collecting penalty cards
- **Damage**: Hearts = 5% each, Queen of Spades = 40%
- **Elimination**: Lowest integrity player is eliminated after each phase

### Phases
1. **Phase 1: The Quadrant** (4 players, 13 cards each)
2. **Phase 2: The Triangle** (3 players, 17 cards each)  
3. **Phase 3: The Duel** (2 players, 13 cards each)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repo
cd Royal-Glitch

# Install all dependencies
npm run install:all

# Start development servers
npm run dev
```

This will start:
- **Client**: http://localhost:3000
- **Server**: http://localhost:3001

### Development

```bash
# Run only client
npm run dev:client

# Run only server
npm run dev:server

# Build for production
npm run build
```

## 🏗️ Project Structure

```
Royal-Glitch/
├── client/                 # Next.js 15 Frontend
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── stores/        # Zustand stores
│   │   ├── lib/           # Utilities & types
│   │   └── styles/        # Global CSS
│
├── server/                 # NestJS Backend
│   ├── src/
│   │   ├── engine/        # Game logic (deck, rules, damage, phase)
│   │   ├── game/          # Game Socket.io gateway
│   │   ├── lobby/         # Room management
│   │   ├── rating/        # Player ratings (JSON persistence)
│   │   └── shared/        # Shared types
│
└── package.json           # Monorepo root
```

## 🎯 Tech Stack

- **Frontend**: Next.js 15, Tailwind CSS, Framer Motion, Zustand
- **Backend**: NestJS, Socket.io
- **Real-time**: WebSocket (Socket.io)
- **Storage**: In-memory + JSON file (for ratings)

## 🎨 Theme: MASK

Players are represented by anonymous masks:
- Venetian
- Kabuki
- Tribal
- Plague Doctor
- Jester
- Phantom

Emotions are expressed through mask animations (shake, glitch, pulse, crack).

## 📊 Rating System

| Placement | Rating Change |
|-----------|---------------|
| 1st (Winner) | +35 |
| 2nd | 0 |
| 3rd | -20 |
| 4th | -35 |

Starting rating: 1000 | Minimum: 0

## 🎮 How to Play

1. **Enter the Club**: Choose your mask and create/join a room
2. **Wait for Players**: Need 4 players, all must be ready
3. **Play Tricks**: Follow standard trick-taking rules (must follow suit)
4. **Avoid Damage**: Hearts = 5% damage, Queen of Spades = 40%
5. **Survive**: Lowest integrity player is eliminated after each phase
6. **Win**: Be the last one standing!

## 🏆 Credits

Built for **Global Game Jam 2026** (School 21)

---

*Hide behind your mask. Survive the elimination. Become the Royal Glitch.*
