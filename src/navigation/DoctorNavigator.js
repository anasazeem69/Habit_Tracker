import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DoctorDashboardScreen from '../screens/doctor/DoctorDashboardScreen';
import PatientDetailScreen from '../screens/doctor/PatientDetailScreen';
import ProfileScreen from '../screens/ProfileScreen'; // Reuse profile for settings/logout

const Stack = createNativeStackNavigator();

const DoctorNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="DoctorDashboard" component={DoctorDashboardScreen} />
            <Stack.Screen name="PatientDetail" component={PatientDetailScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Navigator>
    );
};

export default DoctorNavigator;
