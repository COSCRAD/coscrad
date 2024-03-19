import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { setupStore } from 'store';
import CreditsScreen from './Components/Credits';
import HomeScreen from './Components/Home';
import MenuScreen from './Components/Menu';
import { AlphabetCardDetailScreen } from './Components/alphabet-card-detail.screen';

const Stack = createNativeStackNavigator();

export const App = () => {
    return (
        <Provider store={setupStore()}>
            <NavigationContainer>
                <Stack.Navigator>
                    <Stack.Screen name="Home" component={HomeScreen} />
                    <Stack.Screen name="Menu" component={MenuScreen} />
                    <Stack.Screen name="Detail" component={AlphabetCardDetailScreen} />
                    <Stack.Screen name="Credits" component={CreditsScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        </Provider>
    );
};

export default App;
