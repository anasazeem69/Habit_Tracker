import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { LogBox } from 'react-native';
import { ClerkProvider } from '@clerk/clerk-expo';

LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications', // Suppress Expo Go push notification warning
]);
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import AppNavigator from './src/routes/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { LocationProvider } from './src/context/LocationContext';
import { CategoryProvider } from './src/context/CategoryContext';
import { TerritoryProvider } from './src/context/TerritoryContext';
import { HabitProvider } from './src/context/HabitContext';
import config from './src/config';

const navigationRef = createNavigationContainerRef();

export default function App() {
  const publishableKey = config.CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    console.warn('⚠️ Clerk publishable key is not set. Google sign-in will be disabled.');
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <AuthProvider>
        <LocationProvider>
          <CategoryProvider>
            <TerritoryProvider>
              <HabitProvider>
                <NavigationContainer ref={navigationRef}>
                  <AppNavigator navigationRef={navigationRef} />
                  <StatusBar style="auto" />
                </NavigationContainer>
              </HabitProvider>
            </TerritoryProvider>
          </CategoryProvider>
        </LocationProvider>
      </AuthProvider>
    </ClerkProvider>
  );
}
