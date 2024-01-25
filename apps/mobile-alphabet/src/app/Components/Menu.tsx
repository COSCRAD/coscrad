import React, { useEffect, useState } from 'react';
import { Button, Text, View } from 'react-native';
import config from './Config.json';

interface AlphabetCard {
    letter: string;
    word: string;
    //be careful this is a string, should be parsed
    sequence_number: string;
    letter_audio: string;
    word_audio: string;
    standalone_image: string;
    card_image: string;
}
export interface AlphabetData {
    data: {
        name: string;
        name_english: string;
        poster: {
            name: string;
            url: string;
        };
        alphabet_cards: AlphabetCard[];
    };
}

const MenuScreen = ({ navigation }) => {
    const [alphabetData, setAlphabetData] = useState<AlphabetData | null>(null);

    useEffect(() => {
        //cache this after fetching it once
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
        data: { name, name_english, poster, alphabet_cards: alphabetCards },
    } = alphabetData;

    return (
        <View>
            <Button
                testID="AlphabetDetailLinkButton"
                title={'Detail'}
                onPress={() => navigation.push('Detail')}
            />
        </View>
    );
};

export default MenuScreen;
