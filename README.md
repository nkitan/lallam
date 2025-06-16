# LlamaChat / Lallam 🦙💬

A high-performance, privacy-focused mobile chat application that runs Large Language Models (LLMs) entirely on-device using React Native and llama.cpp.

[![React Native](https://img.shields.io/badge/React%20Native-0.75.0-blue.svg)](https://reactnative.dev/)
[![llama.cpp](https://img.shields.io/badge/llama.cpp-integrated-green.svg)](https://github.com/ggerganov/llama.cpp)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.4-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🌟 Features

- **🔒 Complete Privacy**: All processing happens on-device - your conversations never leave your phone
- **⚡ High Performance**: Optimized with quantized models and hardware acceleration
- **💬 Real-time Chat**: Fluid, responsive chat interface with typing indicators
- **📱 Cross-Platform**: Single codebase for both iOS and Android
- **💾 Local Storage**: Conversation history stored locally with efficient search
- **🎯 Optimized Models**: Support for quantized GGUF models (Gemma, Phi-3, etc.)
- **📊 Performance Metrics**: Optional performance monitoring for advanced users
- **🌙 Modern UI**: Clean, intuitive interface with dark/light mode support

## 🏗️ Architecture

```
┌─────────────────────────────────┐
│         React Native UI         │
├─────────────────────────────────┤
│    State Management (Zustand)   │
├─────────────────────────────────┤
│      TypeScript Services        │
├─────────────────────────────────┤
│    Native Bridge (iOS/Android)  │
├─────────────────────────────────┤
│         llama.cpp Engine        │
├─────────────────────────────────┤
│     Local Storage (SQLite)      │
└─────────────────────────────────┘
```

### Key Components

- **Frontend**: React Native with TypeScript
- **LLM Engine**: llama.cpp with native bridges
- **State Management**: Zustand with persistence
- **Database**: WatermelonDB + SQLite for conversation storage
- **Storage**: MMKV for fast key-value storage, AsyncStorage fallback

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ 
- React Native CLI
- Xcode 14+ (for iOS development)
- Android Studio with SDK 31+ (for Android development)
- Python 3.8+ (for build scripts)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/llamachat.git
   cd llamachat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install iOS dependencies** (iOS only)
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Start Metro bundler**
   ```bash
   npm start
   ```

5. **Run the app**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   ```

## 📱 Platform Setup

### iOS Setup

1. Open `ios/LlamaChat.xcworkspace` in Xcode
2. Configure signing & capabilities
3. Build and run on device or simulator

The iOS implementation uses Objective-C++ bridges in:
- `ios/LlamaChat/LlamaCppBridge.h/m`
- Native module integration with React Native

### Android Setup

1. Ensure Android SDK is properly configured
2. The app requires minimum SDK 21 (Android 5.0)
3. Native modules are in `android/app/src/main/java/com/llamachat/`

The Android implementation includes:
- `LlamaCppModule.java` - Main native module
- `LlamaCppPackage.java` - Package registration
- JNI integration for llama.cpp

## 🔧 Configuration

### Model Configuration

Models are configured in the LLM store (`src/state/llmStore.ts`):

```typescript
const defaultConfig: LLMConfig = {
  modelPath: '',
  modelName: 'Default Model',
  contextSize: 2048,
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  repeatPenalty: 1.1,
  maxTokens: 512,
};
```

### Supported Model Formats

- **GGUF** (recommended): Quantized models optimized for mobile
- **4-bit/8-bit quantization** for reduced memory usage
- Popular models: Gemma 2B, Phi-3 Mini, Llama 2 7B (quantized)

## 📂 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ChatBubble.tsx   # Message display component
│   ├── Header.tsx       # App header
│   ├── MessageInput.tsx # Message input field
│   └── TypingIndicator.tsx # Typing animation
├── screens/             # Main app screens
│   ├── ChatScreen.tsx   # Chat interface
│   └── ConversationListScreen.tsx # Conversation list
├── services/            # Business logic services
│   ├── LLMService.ts    # LLM integration service
│   └── StorageService.ts # Data persistence
├── state/               # State management
│   ├── chatStore.ts     # Chat state (Zustand)
│   └── llmStore.ts      # LLM configuration state
├── native/              # Native bridge interfaces
│   └── LlamaCppBridge.ts # TypeScript bridge interface
├── types/               # TypeScript type definitions
├── theme/               # UI theme and styling
└── utils/               # Utility functions
```

## 🔌 Native Integration

### iOS Native Module

```objc
// LlamaCppBridge.h
@interface LlamaCppBridge : RCTEventEmitter <RCTBridgeModule>
@end
```

### Android Native Module

```java
// LlamaCppModule.java
public class LlamaCppModule extends ReactContextBaseJavaModule {
    @ReactMethod
    public void generateResponse(String prompt, Promise promise) {
        // llama.cpp integration
    }
}
```

## 🎨 UI Components

### Chat Interface
- Modern message bubbles with user/assistant distinction
- Typing indicators during response generation
- Smooth scrolling and animations
- Responsive design for different screen sizes

### Conversation Management
- List view of all conversations
- Search and filter capabilities
- Swipe actions for deletion
- Conversation metadata display

## 💾 Data Management

### Storage Strategy
- **Conversations**: Stored in local SQLite database
- **Messages**: Efficient storage with full-text search
- **Settings**: Fast access via MMKV
- **Models**: Bundled with app or downloaded on first run

### Data Models
```typescript
interface Message {
  id: string;
  text: string;
  isUser: boolean;
  role: 'user' | 'assistant';
  timestamp: number;
  conversationId: string;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: number;
  messageCount: number;
}
```

## ⚡ Performance Optimization

### LLM Optimization
- **Quantized Models**: 4-bit/8-bit quantization for reduced memory
- **Hardware Acceleration**: Neural Engine (iOS) / NNAPI (Android)
- **Efficient Context Management**: Smart context window handling
- **Asynchronous Processing**: Non-blocking UI during inference

### App Performance
- **Lazy Loading**: Components loaded on demand
- **Efficient Rendering**: Optimized FlatList for message history
- **Memory Management**: Proper cleanup and garbage collection
- **Background Processing**: Model inference on background threads

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

## 🔨 Building for Production

### Android
```bash
npm run build:android
# Generates signed APK in android/app/build/outputs/apk/release/
```

### iOS
```bash
npm run build:ios
# Builds for App Store distribution
```

## 🐛 Troubleshooting

### Common Issues

**Model Loading Fails**
- Ensure model file is in correct format (GGUF)
- Check available device memory
- Verify model path configuration

**Performance Issues**
- Monitor device temperature
- Check available RAM
- Consider using smaller model
- Enable hardware acceleration

**Build Errors**
- Clean and rebuild: `npx react-native clean`
- Reset Metro cache: `npx react-native start --reset-cache`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## 📊 Performance Metrics

The app tracks several performance indicators:
- **Tokens per second**: Model inference speed
- **Response latency**: Time from input to first token
- **Memory usage**: RAM consumption during inference
- **Battery impact**: Power consumption monitoring

## 🛣️ Roadmap

- [ ] Multiple model support
- [ ] Voice input/output
- [ ] Conversation sharing (export/import)
- [ ] Custom model training interface
- [ ] Plugin system for extensions
- [ ] Desktop companion app

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Add tests for new features
- Update documentation
- Follow the existing code style
- Test on both iOS and Android

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [llama.cpp](https://github.com/ggerganov/llama.cpp) - High-performance LLM inference
- [React Native](https://reactnative.dev/) - Cross-platform mobile framework
- [Zustand](https://github.com/pmndrs/zustand) - State management
- [WatermelonDB](https://github.com/Nozbe/WatermelonDB) - Reactive database

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/llamachat/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/llamachat/discussions)
- **Email**: support@llamachat.dev

---

**Made with ❤️ for privacy-conscious AI enthusiasts**
