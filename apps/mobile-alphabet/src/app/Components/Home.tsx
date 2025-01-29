import { alphabetButton, homeScreen } from 'app/styles';
import React from 'react';
import { Image, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import Background from './Background';
import config from './config.json';

const HomeScreen = ({ navigation }) => {
    const appName = config.appName;

    const alphabetLanguage = config.language;

    const { width, height } = useWindowDimensions();

    return (
        <Background>
            <View style={[homeScreen.background]} testID="Home">
                <ScrollView>
                    <View>
                        <Image
                            source={{
                                uri: config.appImage,
                            }}
                            style={[
                                homeScreen.homeImage,
                                { marginTop: width > height ? 0 : 120 },
                                { width: width > height ? 100 : 130 },
                                { height: width > height ? 100 : 130 },
                            ]}
                        />
                        <Text style={[homeScreen.appTitle, { margin: width > height ? 0 : 20 }]}>
                            {appName}
                        </Text>
                    </View>
                    <View>
                        <Text style={[homeScreen.tagline, { margin: width > height ? 10 : 38 }]}>
                            Explore the {appName}. Learn {alphabetLanguage} letters, words, and
                            pronounciation with audio.
                        </Text>
                    </View>

                    <View style={[homeScreen.button, { width: width > height ? '40%' : '80%' }]}>
                        <Pressable testID="Menu" onPress={() => navigation.push('Menu')}>
                            <Text style={alphabetButton.alphabetName}>Alphabet</Text>
                        </Pressable>
                    </View>

                    <View style={[homeScreen.button, { width: width > height ? '40%' : '80%' }]}>
                        <Pressable testID="Credits" onPress={() => navigation.navigate('Credits')}>
                            <Text style={alphabetButton.alphabetName}>Credits</Text>
                        </Pressable>
                    </View>
                </ScrollView>

                <View style={[homeScreen.footer, { display: width > height ? 'none' : 'flex' }]}>
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
