import React, { useEffect, useState } from 'react';
import { Button, Text, View } from 'react-native';
import config from './Config.json';
import { AlphabetData } from './Menu';
import { AlphabetCardDetailPresenter } from './alphabet-card-detail.presenter';

export function AlphabetCardDetailScreen() {
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

    const buildFullMediaAssetUrl = (path: string) => `${config.baseMediaAssetUrl}/${path}`;

    return (
        <View testID="AlphabetCardDetail">
            <AlphabetCardDetailPresenter
                {...selectedCard}
                standalone_image={buildFullMediaAssetUrl(selectedCard.standalone_image)}
            />
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
