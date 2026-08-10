import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabs } from './MainTabs';
import TrailDetailScreen from '../screens/TrailDetailScreen';
import SiteDetailScreen from '../screens/SiteDetailScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import { colors } from '../lib/theme';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.white },
        headerTintColor: colors.basalt900,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="TrailDetail" component={TrailDetailScreen} options={{ title: '' }} />
      <Stack.Screen name="SiteDetail" component={SiteDetailScreen} options={{ title: '' }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}
