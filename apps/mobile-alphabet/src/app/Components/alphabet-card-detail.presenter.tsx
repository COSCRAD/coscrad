import React, { useEffect, useState } from 'react';
import { Button, Image, Text, View } from 'react-native';
import config from './Config.json';
import { AlphabetData } from './Menu';

export function AlphabetCardDetailPresenter() {
    const [alphabetData, setAlphabetData] = useState<AlphabetData | null>(null);

    // Sequence numbers are indexed starting at 1
    const [selectedLetterSequenceNumber, setSelectedLetterSequenceNumber] = useState<number>(1);

    useEffect(() => {
        //TODO cache this after fetching it once
        const fetchData = async () => {
            try {
                //TODO use context api
                const response = await fetch(config.apiUrl, {
                    mode: 'cors',
                });
                setAlphabetData(await response.json());
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

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
    return (
        <View testID="AlphabetCardDetail">
            <Image
                style={{ width: 200, height: 200 }}
                resizeMode="cover"
                source={{
                    uri: standalone_image,
                }}
            />
            <Text testID={`${letter}`}>Letter: {letter}</Text>
            <Text testID={`${word}`}>Word: {word}</Text>
            <Text testID={`AlphabetCardDetail/${sequence_number}`}>
                Sequence #: {sequence_number}
            </Text>
            <Text>Image: {card_image}</Text>
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
