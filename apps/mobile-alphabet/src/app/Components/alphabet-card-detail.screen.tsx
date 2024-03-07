import React, { useEffect, useState } from 'react';
import { Button, Image, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setApiData } from './../../store/slices/alphabet-slice';
import config from './Config.json';
import { AlphabetData } from './Menu';

interface alphabetRootState {
    apiData: { [key: string]: AlphabetData };
}

export function AlphabetCardDetailScreen() {
    const dispatch = useDispatch();

    const alphabetApi = useSelector((state: alphabetRootState) => state.apiData);

    const [alphabetData, setAlphabetData] = useState<AlphabetData | null>(null);

    // Sequence numbers are indexed starting at 1
    const [selectedLetterSequenceNumber, setSelectedLetterSequenceNumber] = useState<number>(1);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const endpoint = config.apiUrl;
                if (alphabetApi[endpoint]) {
                    setAlphabetData(alphabetApi[endpoint]);
                } else {
                    const response = await fetch(endpoint, { mode: 'cors' });
                    const data = await response.json();
                    setAlphabetData(data);
                    dispatch(setApiData({ endpoint, data }));
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [alphabetApi, dispatch]);

    if (!alphabetData) {
        return <Text>Loading...</Text>;
    }

    const {
        data: { alphabet_cards: alphabetCards },
    } = alphabetData;

    const selectedCard = alphabetCards.find(({ sequence_number: sequenceNumber }) => {
        return Number.parseInt(sequenceNumber) === selectedLetterSequenceNumber;
    });

    const {
        word,
        letter,
        sequence_number,
        card_image,
        letter_audio,
        word_audio,
        standalone_image,
    } = selectedCard;

    const apiUrlPrefix = config.apiUrlPrefix;

    return (
        <View testID="AlphabetCardDetail">
            <Image
                style={{ height: 300 }}
                resizeMode="contain"
                source={{
                    uri: `${apiUrlPrefix}${card_image.replace('.png', '')}`,
                }}
            />
            <Text testID={`${letter}`}>Letter: {letter}</Text>
            <Text testID={`${word}`}>Word: {word}</Text>
            <Text testID={`AlphabetCardDetail/${sequence_number}`}>
                Sequence #: {sequence_number}
            </Text>
            <Text>Letter Audio:{letter_audio}</Text>
            <Text>Word Audio: {word_audio}</Text>
            <Text>Standalone Image: {standalone_image}</Text>
            <Button
                testID="Back"
                title="Back"
                onPress={() => {
                    setSelectedLetterSequenceNumber(
                        ((selectedLetterSequenceNumber - 2 + alphabetCards.length) %
                            alphabetCards.length) +
                            1
                    );
                }}
            />
            <Button
                testID="Next"
                title="Next"
                onPress={() => {
                    setSelectedLetterSequenceNumber(
                        (selectedLetterSequenceNumber % alphabetCards.length) + 1
                    );
                }}
            />
        </View>
    );
}
