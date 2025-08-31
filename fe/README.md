# Tesis Dashboard Frontend

A modern React dashboard built with TypeScript, Tailwind CSS, and Radix UI components for analyzing material price data.

## Features

- **Modern React 18** with TypeScript
- **Beautiful UI** built with Radix UI components
- **Responsive Design** using Tailwind CSS
- **Type Safety** with TypeScript
- **Fast Development** with Vite
- **Component Library** with reusable UI components
- **Routing** with React Router
- **State Management** with React Query

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Data Fetching**: React Query (TanStack Query)
- **Charts**: Recharts (ready for integration)
- **Forms**: React Hook Form + Zod validation

## 📁 Project Structure

```
fe/
├── src/
│   ├── components/
│   │   ├── ui/           # Reusable UI components
│   │   └── layout/       # Layout components
│   ├── pages/            # Page components
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utility functions
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd fe
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Available Pages

- **Dashboard** (`/`) - Overview with stats and charts
- **Data Explorer** (`/data`) - Browse and search material data
- **Analytics** (`/analytics`) - Advanced data analysis
- **Settings** (`/settings`) - Application configuration

## 🎨 UI Components

The project includes a comprehensive set of reusable UI components:

- **Button** - Multiple variants and sizes
- **Card** - Content containers with headers
- **Input** - Form input fields
- **Switch** - Toggle switches
- **Label** - Form labels
- **Toast** - Notification system

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `fe/` directory:

```bash
# API Configuration
VITE_API_URL=http://localhost:8000
VITE_APP_TITLE=Tesis Dashboard
```

### Tailwind CSS

Custom colors and design tokens are defined in `tailwind.config.js`:

- Primary colors (blue theme)
- Dark mode support
- Custom animations
- Responsive breakpoints

## 📊 Data Integration

The dashboard is designed to work with your FastAPI backend:

- **API Proxy**: Configured to proxy `/api` requests to your backend
- **React Query**: Handles data fetching, caching, and state management
- **Type Safety**: Shared types between frontend and backend

## 🚀 Build & Deploy

### Development
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Linting
```bash
npm run lint
```

## 🎯 Key Features

### Dashboard Overview
- Statistics cards with key metrics
- Chart placeholders for data visualization
- Recent activity feed
- Responsive grid layout

### Data Explorer
- Search and filter capabilities
- Data table with sorting
- Export functionality
- Real-time data updates

### Analytics
- Multiple chart types
- Statistical insights
- Correlation analysis
- Export options

### Settings
- Database configuration
- User preferences
- Notification settings
- Security options

## 🔮 Future Enhancements

- **Real Charts**: Integrate Recharts for data visualization
- **Dark Mode**: Implement theme switching
- **Real-time Updates**: WebSocket integration
- **Advanced Filters**: Date ranges, material types
- **Export Formats**: PDF, Excel, CSV
- **User Authentication**: Login/logout system
- **Responsive Mobile**: Mobile-first design improvements

## 🤝 Contributing

1. Follow the existing code style
2. Use TypeScript for all new components
3. Add proper TypeScript types
4. Test responsive design on different screen sizes
5. Use Radix UI components for accessibility

## 📚 Resources

- [React Documentation](https://react.dev/)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)

## 📄 License

This project is part of your Tesis research project.
