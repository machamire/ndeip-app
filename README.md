# ndeip Messaging App

A modern, premium messaging application built with React Native (Expo), featuring real-time chat, audio villages (Clubhouse-style rooms), stories, video/voice calls, and a unique "Top 3 Favorites" system with Do Not Disturb modes.

---

## 🎨 Design

The app uses a **premium dark theme** inspired by [newmutual.org](https://newmutual.org), built around the ndeip brand colors:

| Color          | Hex       | Usage                          |
|----------------|-----------|--------------------------------|
| Deep Teal      | `#1B4D3E` | Primary brand, buttons, FABs   |
| Electric Blue  | `#2563EB` | Accent, links, Google auth     |
| Emerald        | `#10B981` | Success, online, active states |
| Gold           | `#F59E0B` | Top 3 favorites, stars         |
| Rose           | `#F43F5E` | Errors, destructive actions    |

Design features: glass-morphism cards, rounded-square avatars, ambient glow effects, smooth animations, and warm-tinted neutral grays.

---

## 📁 Project Structure

```
ndeip-app/
├── app/                    # Expo Router file-based routing
│   ├── _layout.tsx         # Root layout (auth gate, theme providers)
│   ├── (tabs)/             # Bottom tab navigation (5 tabs)
│   │   ├── _layout.tsx     # Tab configuration & order
│   │   ├── index.tsx       # Chats screen (center tab)
│   │   ├── status.tsx      # Stories screen (renamed from Status)
│   │   ├── calls.tsx       # Calls screen
│   │   ├── villages.tsx    # Villages (audio rooms) screen
│   │   └── settings.tsx    # Settings screen
│   ├── auth/               # Authentication screens
│   │   ├── login.tsx       # Login with email/Google/QR
│   │   ├── signup.tsx      # Registration
│   │   └── qr-login.tsx    # QR code device linking
│   ├── chat/               # Chat conversation screens
│   ├── features/           # Feature screens
│   │   ├── dnd-settings.tsx # Do Not Disturb modes
│   │   └── top3.tsx        # Top 3 Favorites management
│   └── settings/           # Settings sub-pages
│       ├── edit-profile.tsx
│       ├── privacy.tsx
│       ├── account.tsx
│       ├── chats-settings.tsx
│       ├── storage-data.tsx
│       ├── notifications.tsx
│       ├── linked-devices.tsx
│       ├── help-feedback.tsx
│       ├── lists.tsx
│       ├── starred.tsx
│       └── chat-history.tsx
├── assets/
│   └── images/
│       └── ndeip-logo.png  # Official transparent logo
├── backend/                # Backend logic & API layer
├── components/             # Reusable UI components
├── constants/
│   └── Colors.ts           # Full color system (NDEIP_COLORS)
├── contexts/
│   └── AuthContext.tsx      # Authentication context & provider
├── database/               # Database schemas & migrations
├── hooks/                  # Custom React hooks
│   └── useMeshTheme.js     # Theme provider & mesh patterns
├── lib/
│   └── supabase.ts         # Supabase client configuration
├── services/               # Service layer (API calls)
├── utils/                  # Utility functions
├── analytics/              # Analytics tracking
├── testing/                # Test configurations
├── deployment/             # Deployment configs
└── docs/                   # Documentation
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** or **yarn**
- **Expo CLI** (installed via npx)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/ndeip-app.git
cd ndeip-app

# 2. Install dependencies
npm install

# 3. Start the development server
npx expo start

# 4. Run on specific platforms
npx expo start --web       # Web browser
npx expo start --android   # Android emulator/device
npx expo start --ios       # iOS simulator (macOS only)
```

### Environment Setup

Create a `.env.local` file in the root directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 🛠 Tech Stack

| Category       | Technology                                    |
|----------------|-----------------------------------------------|
| **Framework**  | React Native 0.79.5 + Expo SDK 53             |
| **Router**     | expo-router 5.1.4 (file-based)                |
| **Language**   | TypeScript 5.8                                 |
| **UI**         | React Native core + @expo/vector-icons         |
| **State**      | React Context + Redux Toolkit                  |
| **Backend**    | Supabase (auth, database, realtime)            |
| **Realtime**   | Socket.io client                               |
| **Animations** | React Native Reanimated 3.17                   |
| **Navigation** | @react-navigation/native 7.x                  |
| **Storage**    | AsyncStorage, SecureStore                      |

---

## 📱 Tab Navigation Order

1. **Villages** — Clubhouse-style audio rooms (live, scheduled, my villages)
2. **Stories** — 24-hour disappearing stories with Top 3 priority & ad slots
3. **Chats** — Conversations with Top 3 pinned contacts & unread badges
4. **Calls** — Voice & video call history with missed/all filters
5. **Settings** — Profile, DND, Top 3, privacy, account, and more

---

## ⭐ Key Features

### Top 3 Favorites
- Pin your 3 most important contacts
- They always ring through, even on DND
- Their stories are shown ad-free
- Priority message delivery
- Pinned to top of chat list

### Do Not Disturb Modes
- **Available** — Everyone can reach you
- **Be Quiet** — Only Top 3 and calls come through
- **Get Busy** — Only Top 3 calls come through
- **Do Not Disturb** — Complete silence (Top 3 still override)

### Villages (Audio Rooms)
- Live audio rooms with speaker/listener counts
- Scheduled rooms with notifications
- Create & manage your own villages

### Stories
- 24-hour disappearing stories
- Top 3 contacts shown first (ad-free)
- Sponsored ad slots between regular stories
- Regional News tab

---

## 🔐 Authentication

The app supports:
- **Email/Password** sign-up and sign-in
- **Google OAuth** sign-in
- **QR Code** device linking (for multi-device support)

Auth is managed via `contexts/AuthContext.tsx` and Supabase.

---

## 📂 Key Files Reference

| File | Purpose |
|------|---------|
| `constants/Colors.ts` | Complete color system (`NDEIP_COLORS`) |
| `contexts/AuthContext.tsx` | Auth state, sign-in/out, user profile |
| `hooks/useMeshTheme.js` | Theme provider, mesh patterns, seasonal themes |
| `lib/supabase.ts` | Supabase client initialization |
| `app/_layout.tsx` | Root layout with auth gate |
| `app/(tabs)/_layout.tsx` | Tab bar config (order, icons, styling) |

---

## 🧪 Testing

```bash
npm test           # Run Jest tests
npx detox test     # Run E2E tests (requires setup)
```

---

## 📦 Building for Production

```bash
# Web
npx expo export --platform web

# Android (EAS Build)
npx eas build --platform android

# iOS (EAS Build, macOS only)
npx eas build --platform ios
```

---

## 📄 License

Private — All rights reserved.

---

## 👥 Handover Notes

This project was developed with a focus on **premium UI/UX** and is ready for:
1. **Supabase integration** — Connect real auth & database (currently uses mock data)
2. **Real-time messaging** — Wire up Socket.io for live chat
3. **Push notifications** — expo-notifications is already installed
4. **Audio/video calls** — UI is built, needs WebRTC or similar backend
5. **Image/media handling** — Stories and profile photos need upload pipeline

The design system in `Colors.ts` is comprehensive — use `NDEIP_COLORS` for all styling to maintain consistency.
