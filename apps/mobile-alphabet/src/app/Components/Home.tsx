import React from 'react';
import { Button, Text, View } from 'react-native';

const HomeScreen = ({ navigation }) => {
    return (
        <View testID="Home" style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>Home screen works!</Text>
            <Button title="Terms" />
            <Button title="Paradigms and Vocabulary Lists" />
            <Button testID="Credits" title="Credits" onPress={() => navigation.push('Credits')} />
        </View>
    );
};

export default HomeScreen;
