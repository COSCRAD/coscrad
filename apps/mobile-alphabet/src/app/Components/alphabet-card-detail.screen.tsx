import { faChevronLeft } from '@fortawesome/free-solid-svg-icons/faChevronLeft';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useConfig } from 'app/config';
import { alphabetDetailStyle, colors, detailStyles } from 'app/styles';
import React, { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
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

    return (
        <View style={detailStyles.background} testID="AlphabetCardDetail">
            {!imageError ? (
                <Image
                    style={{ height: 200 }}
                    testID={`loadedImage`}
                    onError={() => setImageError(true)}
                    resizeMode="center"
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

            <View style={alphabetDetailStyle.layout}>
                <View style={alphabetDetailStyle.flexLayout}></View>
                <View style={alphabetDetailStyle.flexLayout}>
                    <Text style={alphabetDetailStyle.letter} testID={`${letter}`}>
                        {letter}
                    </Text>
                </View>
                <View style={alphabetDetailStyle.appAudio}>
                    <AppAudio
                        message={letter}
                        url={`${BASE_API_URL}/resources/mediaitems/download?name=${letter_audio.replace(
                            '.mp3',
                            ''
                        )}`}
                    />
                </View>
            </View>
            <View style={alphabetDetailStyle.layout}>
                <View style={alphabetDetailStyle.flexLayout}></View>
                <View style={alphabetDetailStyle.flexLayout}>
                    <Text style={alphabetDetailStyle.word} testID={`${word}`}>
                        {word}
                    </Text>
                </View>
                <View style={alphabetDetailStyle.appAudio}>
                    <AppAudio
                        message={word}
                        url={`${BASE_API_URL}/resources/mediaitems/download?name=${word_audio.replace(
                            '.mp3',
                            ''
                        )}`}
                    />
                </View>
            </View>

            <View style={alphabetDetailStyle.navigationButtons}>
                <TouchableOpacity
                    style={{ padding: 20 }}
                    onPress={() => {
                        setSelectedLetterSequenceNumber(
                            ((selectedLetterSequenceNumber - 2 + alphabetCards.length) %
                                alphabetCards.length) +
                                1
                        );
                    }}
                >
                    <FontAwesomeIcon color={colors.primary} size={70} icon={faChevronLeft} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ padding: 20 }}
                    onPress={() => {
                        setSelectedLetterSequenceNumber(
                            (selectedLetterSequenceNumber % alphabetCards.length) + 1
                        );
                    }}
                >
                    <FontAwesomeIcon color={colors.primary} size={70} icon={faChevronRight} />
                </TouchableOpacity>
            </View>
        </View>
    );
}
