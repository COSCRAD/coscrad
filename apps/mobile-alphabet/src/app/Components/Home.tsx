import styles, { alphabetButton, creditsButton } from 'app/styles';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

const HomeScreen = ({ navigation }) => {
    return (
        <View testID="Home" style={[styles.background]}>
            <Pressable testID="Menu" onPress={() => navigation.push('Menu')}>
                <Text style={alphabetButton.alphabetName}>Tŝilhqot’in</Text>
                <Text style={alphabetButton.alphabet}>Alphabet </Text>
            </Pressable>

            <Pressable
                style={creditsButton.background}
                testID="Credits"
                onPress={() => navigation.navigate('Credits')}
            >
                <Text style={creditsButton.background}>Credits</Text>
            </Pressable>
        </View>
    );
};

export default HomeScreen;
