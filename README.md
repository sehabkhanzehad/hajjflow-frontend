# HajjFlow Frontend

[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

A modern, responsive **React SPA** frontend for HajjFlow - the comprehensive SaaS platform for Hajj and Umrah pilgrimage management.

## 🌟 Overview

HajjFlow Frontend provides an intuitive, user-friendly interface for agencies to manage their Hajj and Umrah operations. Built with modern React patterns and beautiful UI components, it offers a seamless experience for managing pilgrims, packages, finances, and analytics.

### Key Features

- **📊 Interactive Dashboard**: Real-time analytics and KPIs
- **👥 Pilgrim Management**: Complete pilgrim lifecycle management
- **📦 Package Operations**: Create and manage Hajj/Umrah packages
- **💰 Financial Overview**: Transaction tracking and financial reports
- **👨‍💼 Group Leader Portal**: Dedicated interface for group leaders
- **🌐 Multi-Language Support**: English, Bangla, and Arabic
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile
- **⚡ Fast Performance**: Built with Vite for lightning-fast development
- **🎨 Modern UI**: Beautiful design with Radix UI components

## 🏗️ Technology Stack

**Core Framework:**

- **React 19**: Latest React with concurrent features
- **Vite**: Next-generation frontend tooling
- **TypeScript**: Type-safe JavaScript development

**UI & Styling:**

- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible, unstyled UI components
- **Lucide React**: Beautiful icon library
- **Tailwind Merge**: Intelligent class merging

**State & Data:**

- **TanStack Query**: Powerful data synchronization
- **React Hook Form**: Performant forms with validation
- **Zod**: TypeScript-first schema validation
- **Axios**: HTTP client for API communication

**Internationalization:**

- **i18next**: Internationalization framework
- **react-i18next**: React integration for i18n

**Development Tools:**

- **ESLint**: Code linting and formatting
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- HajjFlow Backend API running

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/sehabkhanzehad/hajjflow-frontend.git
   cd hajjflow-frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment setup**

   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**

   ```env
   VITE_API_BASE_URL=https://api.hajjflow.com
   VITE_APP_NAME=HajjFlow
   VITE_APP_ENV=production
   ```

5. **Start development server**

   ```bash
   npm run dev
   ```

6. **Build for production**

   ```bash
   npm run build
   ```

## 📱 Application Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Radix-based)
│   ├── app/            # App-specific components
│   ├── analytics/      # Analytics components
│   ├── id-card/        # Pilgrim ID card components
│   └── skeletons/      # Loading skeleton components
├── contexts/           # React contexts
│   ├── AuthContext.jsx
│   └── I18nContext.jsx
├── hooks/              # Custom React hooks
├── lib/                # Utilities and configurations
├── locales/            # Translation files
├── pages/              # Page components
└── Layouts/            # Layout components
```

## 🎨 UI Components

### Design System

The application uses a consistent design system built on:

- **Colors**: Professional color palette with dark/light mode support
- **Typography**: Clean, readable fonts with proper hierarchy
- **Spacing**: Consistent spacing scale using Tailwind
- **Components**: Accessible components from Radix UI

### Key Components

- **Dashboard**: Analytics overview with charts and metrics
- **Data Tables**: Sortable, filterable tables with pagination
- **Forms**: Validated forms with error handling
- **Modals**: Accessible modal dialogs
- **Navigation**: Responsive sidebar and top navigation
- **Charts**: Interactive charts using Recharts

## 🌐 Internationalization

Supports multiple languages with easy switching:

- **English** (en)
- **Bangla** (bn)
- **Arabic** (ar)

Translation files are located in `src/locales/` and can be easily extended.

## 🔧 Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

### Code Quality

- **ESLint**: Configured for React and TypeScript
- **Prettier**: Code formatting (via ESLint)
- **TypeScript**: Strict type checking enabled

### Best Practices

- Component composition over inheritance
- Custom hooks for shared logic
- Proper error boundaries
- Accessibility-first approach
- Performance optimization with React.memo and useMemo

## 🚀 Deployment

### Build Process

```bash
# Create production build
npm run build
```

The build outputs optimized assets to the `dist/` directory, ready for deployment to any static hosting service.

### Recommended Hosting

- **Vercel**: Optimal for React SPAs with automatic deployments
- **Netlify**: Great for static sites with form handling
- **AWS S3 + CloudFront**: Scalable cloud hosting
- **GitHub Pages**: Free hosting for open source projects

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure accessibility compliance

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **Radix UI** for accessible component primitives
- **Tailwind CSS** for the utility-first approach
- **Vite** for blazing-fast development experience
- **The React Community** for continuous inspiration

---

**Built with ❤️ for the global Muslim community**
