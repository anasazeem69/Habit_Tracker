import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import TabNavigator from '../navigation/TabNavigator';
import DoctorNavigator from '../navigation/DoctorNavigator';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import OTPScreen from '../screens/auth/OTPScreen';
import CreateHabitScreen from '../screens/CreateHabitScreen';
import HabitDetailScreen from '../screens/HabitDetailScreen';
import CoachScreen from '../screens/CoachScreen';
import SquadLeaderboardScreen from '../screens/SquadLeaderboardScreen';
import ValidationScreen from '../screens/ValidationScreen';
import ChatScreen from '../screens/ChatScreen';
import NotificationScreen from '../screens/NotificationScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import { colors } from '../config/colors';
import FloatingCoachAgent from '../components/FloatingCoachAgent';

const Stack = createNativeStackNavigator();

const AppNavigator = ({ navigationRef }) => {
  const { user, loading } = useContext(AuthContext);

  console.log('🧭 AppNavigator: user =', user ? user.email : 'null', 'loading =', loading);

  return (
    <>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="Login"
      >
        {user ? (
          user.role === 'doctor' ? (
            <Stack.Screen name="DoctorMain" component={DoctorNavigator} />
          ) : (
            <>
              <Stack.Screen name="Main" component={TabNavigator} />
              <Stack.Screen name="CreateHabit" component={CreateHabitScreen} />
              <Stack.Screen name="HabitDetail" component={HabitDetailScreen} />
              <Stack.Screen name="Coach" component={CoachScreen} />
              <Stack.Screen name="SquadLeaderboard" component={SquadLeaderboardScreen} />
              <Stack.Screen name="Validation" component={ValidationScreen} />
              <Stack.Screen name="Chat" component={ChatScreen} />
              <Stack.Screen name="Notifications" component={NotificationScreen} />
              <Stack.Screen name="Analytics" component={AnalyticsScreen} />
            </>
          )
        ) : (
          // User is not authenticated - show auth flow starting with Login
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
            <Stack.Screen name="OTP" component={OTPScreen} />
          </>
        )}
      </Stack.Navigator>

      {/* Show loading overlay when needed */}
      {loading && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background.primary,
          zIndex: 9999
        }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {user && user.role !== 'doctor' && (
        <FloatingCoachAgent
          onOpenCoach={() => {
            if (navigationRef?.isReady()) {
              navigationRef.navigate('Coach');
            }
          }}
        />
      )}
    </>
  );
};

export default AppNavigator;
