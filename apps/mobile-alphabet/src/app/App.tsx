import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { StatusBar, Text } from 'react-native';
import 'react-native-gesture-handler';
import { LaunchArguments } from 'react-native-launch-arguments';
import { Provider } from 'react-redux';
import { setupStore } from 'store';
import Background from './Components/Background';
import CreditsScreen from './Components/Credits';
import HomeScreen from './Components/Home';
import MenuScreen from './Components/Menu';
import { AlphabetCardDetailScreen } from './Components/alphabet-card-detail.screen';
import { ConfigStore, RootStoreProvider, setUpConfig } from './config';
import { colors } from './styles';

const Stack = createNativeStackNavigator();

interface AppLaunchArguments {
    configOverrides?: Partial<ConfigStore>;
}

const App = () => {
    const [config, setConfig] = useState<null | ConfigStore>(null);

    useEffect(() => {
        const configOverrides = LaunchArguments.value<AppLaunchArguments>().configOverrides || {};
        setUpConfig(configOverrides).then(setConfig);
    }, []);

    if (config === null) {
        return <Text>Loading...</Text>;
    }

    return (
        <RootStoreProvider value={config}>
            <Provider store={setupStore()}>
                <Background>
                    <NavigationContainer>
                        <StatusBar backgroundColor={colors.primary} />

                        <Stack.Navigator
                            screenOptions={{
                                headerTitleAlign: 'center',
                                headerTintColor: colors.text,
                                headerStyle: {
                                    backgroundColor: colors.primary,
                                },
                            }}
                        >
                            <Stack.Screen name="Home" component={HomeScreen} />
                            <Stack.Screen
                                options={{ title: 'Select Letter' }}
                                name="Menu"
                                component={MenuScreen}
                            />
                            <Stack.Screen
                                options={{ title: 'Alphabet' }}
                                name="Detail"
                                component={AlphabetCardDetailScreen}
                            />
                            <Stack.Screen name="Credits" component={CreditsScreen} />
                        </Stack.Navigator>
                    </NavigationContainer>
                </Background>
            </Provider>
        </RootStoreProvider>
    );
};

export default App;
