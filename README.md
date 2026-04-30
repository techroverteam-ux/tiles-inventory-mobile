# House Of Tiles Mobile App

A comprehensive React Native mobile application for managing House Of Tiles inventory, built with TypeScript and modern React Native practices.

## 🚀 Features

- **Dashboard**: Overview of inventory statistics and recent activities
- **Product Management**: Add, edit, and manage tile products
- **Inventory Tracking**: Real-time inventory levels and stock management
- **Brand Management**: Organize products by brands
- **Category Management**: Categorize tiles by type and style
- **Size Management**: Manage different tile sizes and dimensions
- **Location Management**: Track inventory across multiple locations
- **Purchase Orders**: Create and manage purchase orders
- **Sales Orders**: Handle sales transactions and orders
- **Reports**: Generate comprehensive inventory reports
- **User Authentication**: Secure login and user management
- **Theme Support**: Light and dark theme options
- **Offline Support**: Works offline with data synchronization

## 📱 Screenshots

<!-- Add screenshots here when available -->

## 🛠️ Tech Stack

- **React Native** - Cross-platform mobile development
- **TypeScript** - Type-safe JavaScript
- **React Navigation** - Navigation library
- **React Context** - State management
- **React Native Vector Icons** - Icon library
- **React Native Linear Gradient** - Gradient components
- **React Native Toast Message** - Toast notifications
- **Async Storage** - Local data persistence

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or higher)
- [React Native CLI](https://reactnative.dev/docs/environment-setup)
- [Android Studio](https://developer.android.com/studio) (for Android development)
- [Xcode](https://developer.apple.com/xcode/) (for iOS development, macOS only)
- [Java Development Kit (JDK)](https://www.oracle.com/java/technologies/javase-downloads.html)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/techroverteam-ux/tiles-inventory-mobile.git
   cd tiles-inventory-mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Install iOS dependencies** (iOS only)
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

## 🏃‍♂️ Running the App

### Android
```bash
npm run android
# or
yarn android
```

### iOS
```bash
npm run ios
# or
yarn ios
```

### Start Metro Bundler
```bash
npm start
# or
yarn start
```

## 🏗️ Build for Production

### Android
```bash
cd android
./gradlew assembleRelease
```

### iOS
1. Open `ios/TilesInventory.xcworkspace` in Xcode
2. Select "Generic iOS Device" or your connected device
3. Product → Archive

## 📁 Project Structure

```
src/
├── assets/           # Images, fonts, and other static assets
├── components/       # Reusable UI components
│   ├── common/       # Common components
│   ├── loading/      # Loading components
│   └── navigation/   # Navigation components
├── context/          # React Context providers
├── hooks/           # Custom React hooks
├── navigation/      # Navigation configuration
├── screens/         # Screen components
│   ├── auth/        # Authentication screens
│   ├── dashboard/   # Dashboard screens
│   ├── inventory/   # Inventory management screens
│   ├── products/    # Product management screens
│   ├── orders/      # Order management screens
│   ├── settings/    # Settings and management screens
│   └── reports/     # Reports screens
├── services/        # API services and utilities
├── theme/           # Theme configuration
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

## 🎨 Theming

The app supports both light and dark themes. Theme configuration can be found in:
- `src/theme/` - Theme definitions
- `src/context/ThemeContext.tsx` - Theme context provider

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
API_BASE_URL=https://your-api-url.com
API_TIMEOUT=10000
```

### API Configuration
API services are configured in `src/services/api/ApiServices.ts`

## 🧪 Testing

```bash
# Run tests
npm test
# or
yarn test

# Run tests with coverage
npm run test:coverage
# or
yarn test:coverage
```

## 📱 Supported Platforms

- **Android**: API level 21+ (Android 5.0+)
- **iOS**: iOS 11.0+

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **TechRover Team** - Development Team

## 📞 Support

For support and questions, please contact:
- Email: support@techrover.com
- GitHub Issues: [Create an issue](https://github.com/techroverteam-ux/tiles-inventory-mobile/issues)

## 🔄 Version History

- **v1.0.0** - Initial release with core inventory management features
- **v1.1.0** - Added brand, category, size, and location management
- **v1.2.0** - Enhanced dashboard with analytics and reports

## 🙏 Acknowledgments

- React Native community for excellent documentation
- Contributors who helped shape this project
- Open source libraries that made this project possible

---

Made with ❤️ by TechRover Team