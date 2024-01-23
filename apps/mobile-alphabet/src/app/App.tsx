import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import 'react-native-gesture-handler';
import CreditsScreen from './Components/Credits';
import HomeScreen from './Components/Home';
import MenuScreen from './Components/Menu';
import MenuDetailScreen from './Components/Menu-detail.presenter';

const Stack = createNativeStackNavigator();

export const App = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Menu" component={MenuScreen} />
                <Stack.Screen name="Detail" component={MenuDetailScreen} />
                <Stack.Screen name="Credits" component={CreditsScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default App;
