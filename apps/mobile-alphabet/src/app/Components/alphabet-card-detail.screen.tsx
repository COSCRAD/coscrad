import { useConfig } from 'app/config';
import { alphabetCard, alphabetDetailStyle, loadingComponent } from 'app/styles';
import React, { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';
import GestureRecognizer from 'react-native-swipe-gestures';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store';
import { selectAlphabet } from '../../store/slices/selectors';
import { fetchAlphabets } from './../../store/slices/alphabet-slice';
import { AppAudio } from './audio';
import Background from './Background';
import config from './config.json';

/**
 *
 * TODO Fix the project.json (remove package.json?) so that you can import
 * from libs and then import these from the validation lib.
 */

const isNull = (input: unknown): input is null => input === null;

const isUndefined = (input: unknown): input is undefined => typeof input === 'undefined';

const isNullOrUndefined = (input: unknown): input is null | undefined =>
    isNull(input) || isUndefined(input);

export function AlphabetCardDetailScreen({ route }) {
    const {
        env: { BASE_API_URL, TARGET_ALPHABET_NAME },
    } = useConfig();

    const dispatch = useDispatch<AppDispatch>();

    const { isLoading, errorInfo, data: alphabetData } = useSelector(selectAlphabet);

    const initialCardNumber = route.params.selectedCardNumber || 1;

    // TODO create a `useLoadableAlphabet` hook
    // Better yet, createa  `useLoadableCardBySequenceNumber` hooks
    useEffect(() => {
        if (isNull(alphabetData)) dispatch(fetchAlphabets());
    }, [alphabetData, dispatch]);

    const [imageError, setImageError] = useState(false);

    // Sequence numbers are indexed starting at 1
    const [selectedLetterSequenceNumber, setSelectedLetterSequenceNumber] =
        useState<number>(initialCardNumber);

    if (isLoading || isNull(alphabetData)) {
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

    const swipeRight = () => {
        setSelectedLetterSequenceNumber(
            ((selectedLetterSequenceNumber - 2 + alphabetCards.length) % alphabetCards.length) + 1
        );
    };

    const swipeLeft = () => {
        setSelectedLetterSequenceNumber((selectedLetterSequenceNumber % alphabetCards.length) + 1);
    };

    return (
        <Background>
            <GestureRecognizer onSwipeLeft={swipeLeft} onSwipeRight={swipeRight}>
                <View style={{ height: '100%' }} testID="AlphabetCardDetail">
                    <View style={alphabetCard.card}>
                        <AppAudio
                            message={letter}
                            url={`${BASE_API_URL}/resources/mediaitems/download?name=${letter_audio.replace(
                                '.mp3',
                                ''
                            )}`}
                        />
                        {!imageError ? (
                            <Image
                                style={alphabetCard.image}
                                testID={`loadedImage`}
                                onError={() => setImageError(true)}
                                resizeMode="contain"
                                source={{
                                    uri: `${BASE_API_URL}/resources/mediaitems/download?name=${standalone_image.replace(
                                        '.png',
                                        ''
                                    )}`,
                                }}
                            />
                        ) : (
                            <Text testID={`imageError`}>Error loading image.</Text>
                        )}
                        <AppAudio
                            message={word}
                            url={`${BASE_API_URL}/resources/mediaitems/download?name=${word_audio.replace(
                                '.mp3',
                                ''
                            )}`}
                        />
                    </View>

                    <View>
                        <Text style={alphabetDetailStyle.hint}>Swipe Left/Right</Text>
                    </View>
                </View>
            </GestureRecognizer>
        </Background>
    );
}
