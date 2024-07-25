import { useConfig } from 'app/config';
import React, { useEffect, useState } from 'react';
import { Button, Image, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store';
import { selectAlphabet } from '../../store/slices/selectors';
import { fetchAlphabets } from './../../store/slices/alphabet-slice';
import { AppAudio } from './audio';

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
    const {
        env: { BASE_API_URL, TARGET_ALPHABET_NAME },
    } = useConfig();

    const dispatch = useDispatch<AppDispatch>();

    const { isLoading, errorInfo, data: alphabetData } = useSelector(selectAlphabet);

    // TODO create a `useLoadableAlphabet` hook
    // Better yet, createa  `useLoadableCardBySequenceNumber` hooks
    useEffect(() => {
        if (isNull(alphabetData)) dispatch(fetchAlphabets());
    }, [alphabetData, dispatch]);

    const [imageError, setImageError] = useState(false);

    // Sequence numbers are indexed starting at 1
    const [selectedLetterSequenceNumber, setSelectedLetterSequenceNumber] = useState<number>(1);

    if (isLoading || isNull(alphabetData)) {
        return <Text>Loading...</Text>;
    }

    if (!isNullOrUndefined(errorInfo)) {
        // TODO display error code
        return <Text>Error: {errorInfo.message}</Text>;
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

    const apiUrlPrefix = `${BASE_API_URL}/games/${TARGET_ALPHABET_NAME}`;

    return (
        <View testID="AlphabetCardDetail">
            {!imageError ? (
                <Image
                    style={{ height: 300 }}
                    testID={`loadedImage`}
                    onError={() => setImageError(true)}
                    resizeMode="contain"
                    source={{
                        uri: `${BASE_API_URL}/resources/mediaitems/download?name=${card_image.replace(
                            '.png',
                            ''
                        )}`,
                    }}
                />
            ) : (
                <Text testID={`imageError`}>Error loading image.</Text>
            )}

            <Text>Base Api Url: {BASE_API_URL}</Text>
            <Text testID={`${letter}`}>Letter: {letter}</Text>
            <Text testID={`${word}`}>Word: {word}</Text>
            <Text testID={`AlphabetCardDetail/${sequence_number}`}>
                Sequence #: {sequence_number}
            </Text>
            <Text>Letter Audio:{letter_audio}</Text>
            <Text>Word Audio: {word_audio}</Text>
            <Text>Standalone Image: {standalone_image}</Text>
            <Text>
                Word Audio URL: {BASE_API_URL}
                {`/resources/mediaitems/download?name=${word_audio.replace('.mp3', '')}`}
            </Text>

            <AppAudio
                message="Play Letter"
                url={`${BASE_API_URL}/resources/mediaitems/download?name=${letter_audio.replace(
                    '.mp3',
                    ''
                )}`}
            />

            <AppAudio
                message="Play Word"
                url={`${BASE_API_URL}/resources/mediaitems/download?name=${word_audio.replace(
                    '.mp3',
                    ''
                )}`}
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
