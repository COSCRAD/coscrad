import { alphabetButton, homeScreen } from 'app/styles';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import Background from './Background';
import config from './config.json';

const HomeScreen = ({ navigation }) => {
    const appName = config.appName;

    const alphabetLanguage = config.language;

    return (
        <Background>
            <View style={[homeScreen.background]} testID="Home">
                <View>
                    <Image
                        source={{
                            uri: config.appImage,
                        }}
                        style={[homeScreen.homeImage]}
                    />
                    <Text style={[homeScreen.appTitle]}>{appName}</Text>
                </View>
                <View>
                    <Text style={[homeScreen.tagline]}>
                        Explore the {appName}. Learn {alphabetLanguage} letters, words, and
                        pronounciation with audio.
                    </Text>
                </View>

                <View style={[homeScreen.button]}>
                    <Pressable testID="Menu" onPress={() => navigation.push('Menu')}>
                        <Text style={alphabetButton.alphabetName}>Alphabet</Text>
                    </Pressable>
                </View>

                <View style={[homeScreen.button]}>
                    <Pressable testID="Credits" onPress={() => navigation.navigate('Credits')}>
                        <Text style={alphabetButton.alphabetName}>Credits</Text>
                    </Pressable>
                </View>
                <View style={[homeScreen.footer]}>
                    <Text style={[homeScreen.footerText]}>
                        A project built on the
                        <Image
                            source={{
                                uri: 'https://tsilhqotinlanguage.ca/assets/COSCRAD-logo-prototype-1.png',
                            }}
                            alt="Coscrad"
                            style={[homeScreen.homeImage]}
                        />
                        platform.
                    </Text>
                </View>
            </View>
        </Background>
    );
};

export default HomeScreen;
