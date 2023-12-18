import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

interface AlphabetData {
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
                const response = await fetch('http://10.0.2.2:3131/api/games/alphabet', {
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
