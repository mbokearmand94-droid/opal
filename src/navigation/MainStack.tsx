import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/Home';
import ProjectDetails from '../screens/ProjectDetails';
import ProjectsList from '../screens/ProjectsList';
import SettingsScreen from '../screens/Settings';

const Stack = createNativeStackNavigator();

export default function MainStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Opal' }} />
      <Stack.Screen name="ProjectsList" component={ProjectsList} options={{ title: 'Mes projets' }} />
      <Stack.Screen name="ProjectDetails" component={ProjectDetails} options={{ title: 'Projet' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Paramètres' }} />
    </Stack.Navigator>
  );
}
