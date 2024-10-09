import styles, { colors } from 'app/styles';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

const HomeScreen = ({ navigation }) => {
    return (
        <View testID="Home" style={styles.background}>
            <Pressable testID="Menu" onPress={() => navigation.push('Menu')}>
                <Text
                    style={{
                        fontSize: 60,
                        color: colors.primary,
                        fontWeight: '900',
                        fontFamily: 'OpenSans',
                    }}
                >
                    Tŝilhqot’in
                </Text>
                <Text style={{ fontSize: 40, color: colors.accent, fontFamily: 'OpenSans' }}>
                    Alphabet{' '}
                </Text>
            </Pressable>

            <Pressable
                style={{
                    position: 'absolute',
                    bottom: 30,
                    left: 0,
                    right: 0,
                }}
                testID="Credits"
                onPress={() => navigation.navigate('Credits')}
            >
                <Text
                    style={{
                        textAlign: 'center',
                        fontSize: 30,
                        fontFamily: 'arial',
                        color: colors.accent,
                    }}
                >
                    Credits
                </Text>
            </Pressable>
        </View>
    );
};

export default HomeScreen;
