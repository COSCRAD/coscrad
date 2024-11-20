import { IAlphabetChart } from '@coscrad/api-interfaces';
import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import { Loading } from '../loading';
import { AlphabetPresenter } from './AlphabetPresenter';

export const AlphabetPage = (): JSX.Element => {
    const endpoint = `https://coscradapi.tsilhqotinlanguage.ca/api/games/alphabet`;

    const baseMediaUrl = `https://coscradapi.tsilhqotinlanguage.ca/api/resources/mediaItems/download?name=`;

    const [alphabet, setAlphabet] = useState<IAlphabetChart | null>(null);

    useEffect(() => {
        fetch(endpoint).then(async (result) => {
            const alphabetData = (await result.json()) as unknown as IAlphabetChart;
            console.log({ alphabetData });

            const dataWithFullUrls: IAlphabetChart = {
                ...alphabetData,
                data: {
                    ...alphabetData.data,
                    alphabet_cards: alphabetData.data.alphabet_cards.map((card) => ({
                        ...card,
                        card_image: `${baseMediaUrl}${card.card_image}`,
                        standalone_image: `${baseMediaUrl}${card.standalone_image}`,

                        word_audio: `${baseMediaUrl}${card.word_audio}`,

                        letter_audio: `${baseMediaUrl}${card.letter_audio}`,
                    })),
                },
            };

            if (alphabet === null) setAlphabet(dataWithFullUrls);
        });
    }, [alphabet, baseMediaUrl, endpoint]);

    if (alphabet === null) {
        return <Loading />;
    }

    return (
        <Box>
            <AlphabetPresenter {...alphabet} />
        </Box>
    );
};
