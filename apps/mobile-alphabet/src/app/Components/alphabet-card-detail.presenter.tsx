import React from 'react';
import { Image, Text, View } from 'react-native';
import { AlphabetCard } from './Menu';

export type AlphabetCardDetailProps = AlphabetCard;

export function AlphabetCardDetailPresenter({
    word,
    letter,
    sequence_number,
    word_audio,
    letter_audio,
    card_image,
    standalone_image,
}: AlphabetCardDetailProps) {
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
        </View>
    );
}
