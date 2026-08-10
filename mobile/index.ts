import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent handles both Expo Go and native builds, and calls
// AppRegistry.registerComponent('main', () => App) under the hood.
registerRootComponent(App);
