import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { setupStore } from 'store';
import CreditsScreen from './Components/Credits';
import HomeScreen from './Components/Home';
import MenuScreen from './Components/Menu';
import { AlphabetCardDetailScreen } from './Components/alphabet-card-detail.screen';
import { ConfigStore, RootStoreProvider, setUpConfig } from './config';

const Stack = createNativeStackNavigator();

const App = () => {
    const [config, setConfig] = useState<null | ConfigStore>(null);

    useEffect(() => {
        setUpConfig().then(setConfig);
    }, []);

    if (config === null) {
        return <Text>Loading...</Text>;
    }

    return (
        <RootStoreProvider value={config}>
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
        </RootStoreProvider>
    );
};

export default App;
