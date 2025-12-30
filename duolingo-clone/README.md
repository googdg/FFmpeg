# 🦉 多邻国 UG 版 - 免费英语学习平台

多邻国 UG 版是一个免费的英语学习平台，无需注册即可使用所有功能。采用游戏化学习方式，包含互动练习和现代化的React架构。

## ✨ Features

### 🎮 Gamification System
- **XP Points**: Earn experience points for completing lessons
- **Streak Counter**: Maintain daily learning streaks
- **Hearts System**: Limited attempts with heart regeneration
- **Gems Currency**: Virtual currency for purchasing items
- **Achievements**: Unlock badges and milestones
- **Leaderboards**: Compete with friends and other learners

### 📚 Learning Features
- **Skill Tree**: Progressive learning path with unlockable skills
- **Multiple Exercise Types**:
  - Multiple choice questions
  - Translation exercises
  - Listening comprehension
  - Speaking practice (with speech recognition)
  - Fill-in-the-blank
  - Word ordering
- **Adaptive Learning**: Difficulty adjusts based on performance
- **Spaced Repetition**: Review system for better retention

### 🎨 User Experience
- **Duolingo-inspired UI**: Faithful recreation of the original design
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **PWA Support**: Install as a native app
- **Offline Learning**: Download lessons for offline use
- **Multi-language Interface**: Support for multiple UI languages

### 🔧 Technical Features
- **Modern React Architecture**: Built with React 18+ and TypeScript
- **State Management**: Redux Toolkit for complex state handling
- **Styled Components**: CSS-in-JS with theme support
- **Animations**: Smooth transitions with Framer Motion
- **Performance Optimized**: Code splitting and lazy loading

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd duolingo-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 🏗️ Project Structure

```
duolingo-clone/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/         # Generic components (Button, Modal, etc.)
│   │   ├── layout/         # Layout components (Header, Sidebar)
│   │   └── learning/       # Learning-specific components
│   ├── pages/              # Page components
│   │   ├── Home/          # Landing page
│   │   ├── Auth/          # Login/Register pages
│   │   ├── Learn/         # Learning interface
│   │   └── Profile/       # User profile
│   ├── store/             # Redux store and slices
│   │   └── slices/        # Redux slices for different features
│   ├── services/          # API services
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript type definitions
│   ├── styles/            # Global styles and theme
│   └── assets/            # Static assets
├── public/                # Public assets
└── docs/                  # Documentation
```

## 🎯 Core Components

### Authentication System
- User registration and login
- JWT token management
- Protected routes
- Password strength validation

### Learning Engine
- Course and lesson management
- Exercise generation and validation
- Progress tracking
- Performance analytics

### Gamification
- XP calculation and level progression
- Streak tracking and maintenance
- Achievement system
- Virtual economy (hearts, gems)

### User Interface
- Responsive design system
- Theme management
- Animation system
- Accessibility features

## 🔧 Technology Stack

### Frontend
- **React 18+** - Modern React with hooks and concurrent features
- **TypeScript** - Type safety and better developer experience
- **Redux Toolkit** - Predictable state management
- **React Router v6** - Client-side routing
- **Styled Components** - CSS-in-JS styling solution
- **Framer Motion** - Animation library
- **Vite** - Fast build tool and development server

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Jest** - Unit testing
- **React Testing Library** - Component testing

### PWA Features
- **Workbox** - Service worker management
- **Web App Manifest** - App-like experience
- **Offline Support** - Cached content for offline use

## 🎨 Design System

### Colors
- **Primary Green**: `#58cc02` (Duolingo's signature green)
- **Secondary Blue**: `#1cb0f6` 
- **Error Red**: `#ff4b4b`
- **Warning Yellow**: `#ffc800`

### Typography
- **Primary Font**: Nunito (Google Fonts)
- **Font Weights**: 300, 400, 600, 700, 800

### Components
- Consistent spacing scale (4px base unit)
- Rounded corners (4px, 8px, 12px, 16px)
- Drop shadows for depth
- Smooth transitions and animations

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px  
- **Desktop**: > 1024px

### Mobile-First Approach
- Touch-friendly interface
- Optimized for small screens
- Swipe gestures support
- Native app-like experience

## 🔒 Security Features

- Input validation and sanitization
- XSS protection
- CSRF protection
- Secure authentication flow
- Rate limiting
- Content Security Policy

## 🌐 Internationalization

- Multi-language UI support
- RTL language support
- Locale-specific formatting
- Dynamic language switching

## 📊 Performance Optimizations

- Code splitting and lazy loading
- Image optimization
- Bundle size optimization
- Caching strategies
- Service worker implementation

## 🧪 Testing Strategy

- Unit tests for components
- Integration tests for user flows
- E2E tests for critical paths
- Accessibility testing
- Performance testing

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel --prod
```

### Deploy to Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Follow the existing code style
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Duolingo** - For the inspiration and design patterns
- **React Team** - For the amazing framework
- **Open Source Community** - For the incredible tools and libraries

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the documentation
- Join our community discussions

---

**Built with ❤️ and lots of ☕**

*This is an educational project created to demonstrate modern React development practices and is not affiliated with Duolingo Inc.*