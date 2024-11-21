import { IAlphabetChart } from '@coscrad/api-interfaces';
import { isNonEmptyObject, isNullOrUndefined } from '@coscrad/validation-constraints';
import { Box } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { getConfig } from '../../config';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { Loading } from '../loading';
import { NotFoundPresenter } from '../not-found';
import { AlphabetPresenter } from './AlphabetPresenter';

export const AlphabetPage = (): JSX.Element => {
    const { alphabetConfig } = useContext(ConfigurableContentContext);

    const baseUrl = getConfig().apiUrl;

    const endpoint = `${baseUrl}/games/alphabet`;

    const baseMediaUrl = `${baseUrl}/resources/mediaItems/download?name=`;

    const [alphabet, setAlphabet] = useState<IAlphabetChart | null>(null);

    useEffect(() => {
        fetch(endpoint).then(async (result) => {
            // don't fetch if the alphabet has been fetched or if the alphabet has not been configured
            if (alphabet !== null || !isNonEmptyObject(alphabetConfig)) return;

            const alphabetData = (await result.json()) as unknown as IAlphabetChart;
            console.log({ alphabetData });

            const dataWithFullUrls: IAlphabetChart = {
                ...alphabetData,
                data: {
                    ...alphabetData.data,
                    alphabet_cards: alphabetData.data.alphabet_cards
                        .map((card) => ({
                            ...card,
                            card_image: `${baseMediaUrl}${card.card_image}`,
                            standalone_image: `${baseMediaUrl}${card.standalone_image}`,

                            word_audio: `${baseMediaUrl}${card.word_audio}`,

                            letter_audio: `${baseMediaUrl}${card.letter_audio}`,
                        }))
                        .sort(
                            (cardA, cardB) =>
                                parseInt(cardA.sequence_number) - parseInt(cardB.sequence_number)
                        ),
                },
            };

            setAlphabet(dataWithFullUrls);
        });
    }, [alphabet, baseMediaUrl, endpoint, alphabetConfig]);

    if (isNullOrUndefined(alphabetConfig)) {
        return <NotFoundPresenter />;
    }

    if (alphabet === null) {
        return <Loading />;
    }

    return (
        <Box>
            <AlphabetPresenter {...alphabet} />
        </Box>
    );
};
