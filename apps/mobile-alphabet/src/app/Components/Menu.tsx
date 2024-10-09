import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { Pressable, ScrollView, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store';
import { fetchAlphabets } from '../../store/slices/alphabet-slice';
import { selectAlphabet } from '../../store/slices/selectors';

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
        return <Text>Loading...</Text>;
    }

    if (isLoading) {
        // TODO break out a Loading component
        return <Text>Loading...</Text>;
    }

    if (errorInfo) {
        return <Text>Justin- Finish this</Text>;
    }

    // TODO Use the alphabet cards to create a menu
    const {
        data: { name, name_english, poster, alphabet_cards: alphabetCards },
    } = alphabetData;

    return (
        <ScrollView style={{ backgroundColor: 'white' }}>
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
                    <Text style={{ fontSize: 30, fontFamily: 'arial', textAlign: 'center' }}>
                        {letter}
                    </Text>
                </Pressable>
            ))}
        </ScrollView>
    );
};

export default MenuScreen;
