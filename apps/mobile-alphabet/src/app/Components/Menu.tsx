import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { errorComponent, loadingComponent, menuScreen } from 'app/styles';
import React, { useEffect } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store';
import { fetchAlphabets } from '../../store/slices/alphabet-slice';
import { selectAlphabet } from '../../store/slices/selectors';
import Background from './Background';
import config from './config.json';

// TODO import this from lib
const isNull = (input: unknown): input is null => input === null;

type NavigationState = {
    Detail: {
        selectedCardNumber: number | undefined;
    };
};

const MenuScreen = ({ navigation }: NativeStackScreenProps<NavigationState, 'Detail'>) => {
    const dispatch = useDispatch<AppDispatch>();

    const { isLoading, errorInfo, data: alphabetData } = useSelector(selectAlphabet);

    useEffect(() => {
        if (isNull(alphabetData)) dispatch(fetchAlphabets());
    }, [alphabetData, dispatch]);

    if (isNull(alphabetData)) {
        // TODO break out a Loading component
        return (
            <Background>
                <View style={[loadingComponent.center]}>
                    <Image
                        style={[loadingComponent.image]}
                        source={{
                            uri: config.appImage,
                        }}
                    />
                    <Text style={[loadingComponent.text]}>Loading</Text>
                </View>
            </Background>
        );
    }

    if (isLoading) {
        // TODO break out a Loading component
        return (
            <Background>
                <Text style={[loadingComponent.text]}>Loading...</Text>
            </Background>
        );
    }

    if (errorInfo) {
        return (
            <Background>
                <Text style={[errorComponent.text]}>Error: {errorInfo.message}</Text>
            </Background>
        );
    }

    // TODO Use the alphabet cards to create a menu
    const {
        data: { name, name_english, poster, alphabet_cards: alphabetCards },
    } = alphabetData;

    return (
        <Background>
            <ScrollView>
                {alphabetCards.map(({ letter, sequence_number: sequenceNumber }) => (
                    <Pressable
                        key={letter}
                        testID={sequenceNumber}
                        onPress={() => {
                            navigation.navigate('Detail', {
                                selectedCardNumber: parseInt(sequenceNumber),
                            });
                        }}
                    >
                        <Text style={[menuScreen.alphabet]}>{letter}</Text>
                    </Pressable>
                ))}
            </ScrollView>
        </Background>
    );
};

export default MenuScreen;
