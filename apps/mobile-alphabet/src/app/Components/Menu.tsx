import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import config from './Config.json';

export interface AlphabetData {
    data: {
        name: string;
        name_english: string;
        poster: {
            name: string;
            url: string;
        };
    };
}

export function MenuScreen() {
    const [alphabetData, setAlphabetData] = useState<AlphabetData | null>(null);

    useEffect(() => {
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
        data: { name, name_english, poster },
    } = alphabetData;

    return (
        <View>
            <Text>Name: {name}</Text>
            <Text>English: {name_english}</Text>
            <Text>Poster: {poster.name}</Text>
            <Text>Poster URL: {poster.url}</Text>
        </View>
    );
}

export default MenuScreen;
