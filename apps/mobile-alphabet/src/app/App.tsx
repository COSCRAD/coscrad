import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import 'react-native-gesture-handler';
import CreditsScreen from './Components/Credits';
import HomeScreen from './Components/Home';

// function HomeScreens({ navigation }) {
//     return (
//         <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
//             <Text>Home screen works!</Text>
//             <Button title="Terms" />
//             <Button title="Paradigms and Vocabulary Lists" />
//             <Button title="Credits" onPress={() => navigation.push('Credits')} />
//         </View>
//     );
// }

const Stack = createNativeStackNavigator();

export const App = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="HomeScreens">
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen
                    options={{ title: 'Credits' }}
                    name="Credits"
                    component={CreditsScreen}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default App;
