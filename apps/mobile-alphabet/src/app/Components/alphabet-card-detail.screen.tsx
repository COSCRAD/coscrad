import React, { useEffect, useState } from 'react';
import { Button, Image, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store';
import { selectAlphabet } from '../../store/slices/selectors';
import { fetchAlphabets } from './../../store/slices/alphabet-slice';
import config from './Config.json';

/**
 *
 * TODO Fix the project.json (remove package.json?) so that you can import
 * from libs and then import these from the validation lib.
 */
const isNull = (input: unknown): input is null => input === null;

const isUndefined = (input: unknown): input is undefined => typeof input === 'undefined';

const isNullOrUndefined = (input: unknown): input is null | undefined =>
    isNull(input) || isUndefined(input);

export function AlphabetCardDetailScreen() {
    const dispatch = useDispatch<AppDispatch>();

    const { isLoading, errorInfo, data: alphabetData } = useSelector(selectAlphabet);

    // TODO create a `useLoadableAlphabet` hook
    // Better yet, createa  `useLoadableCardBySequenceNumber` hooks
    useEffect(() => {
        if (isNull(alphabetData)) dispatch(fetchAlphabets());
    }, [alphabetData, dispatch]);

    // Sequence numbers are indexed starting at 1
    const [selectedLetterSequenceNumber, setSelectedLetterSequenceNumber] = useState<number>(1);

    if (isLoading || isNull(alphabetData)) {
        return <Text>Loading...</Text>;
    }

    if (!isNullOrUndefined(errorInfo)) {
        return <Text>Error loading data.</Text>;
    }

    const {
        data: { alphabet_cards: alphabetCards },
    } = alphabetData;

    const selectedCard = alphabetCards.find(({ sequence_number: sequenceNumber }) => {
        return Number.parseInt(sequenceNumber) === selectedLetterSequenceNumber;
    });

    // The data is validate so really this is a system error
    if (isUndefined(selectedCard)) {
        // TODO handle this properly
        return <div>Card not found!</div>;
    }

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
