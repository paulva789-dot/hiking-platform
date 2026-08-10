import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import TrailsScreen from '../screens/TrailsScreen';
import SitesScreen from '../screens/SitesScreen';
import GuidesScreen from '../screens/GuidesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { colors } from '../lib/theme';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const ICONS: Record<keyof MainTabParamList, string> = {
  Home: '⌂',
  Trails: '⛰',
  Sites: '★',
  Guides: '☺',
  Profile: '●',
};

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.forest700,
        tabBarInactiveTintColor: colors.basalt400,
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>{ICONS[route.name as keyof MainTabParamList]}</Text>,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Trails" component={TrailsScreen} />
      <Tab.Screen name="Sites" component={SitesScreen} options={{ title: 'Sites' }} />
      <Tab.Screen name="Guides" component={GuidesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
