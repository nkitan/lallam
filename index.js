/**
 * LlamaChat - On-Device LLM Chat Application
 * Entry point for the React Native application
 */

import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
