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

    const { apiUrl: baseUrl } = getConfig();

    const endpoint = `${baseUrl}/games/${alphabetConfig.alphabetChartName}`;

    const baseMediaUrl = `${alphabetConfig.baseDigitalAssetUrl}`;

    const [alphabet, setAlphabet] = useState<IAlphabetChart | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        if (!isNullOrUndefined(alphabet)) {
            return;
        }

        console.log(`fetching`);
        fetch(endpoint).then(async (result) => {
            // don't fetch if the alphabet has been fetched or if the alphabet has not been configured
            if (alphabet !== null || !isNonEmptyObject(alphabetConfig)) return;

            if (result.status !== 200) {
                setIsError(true);
                setIsLoading(false);
                return;
            }

            const alphabetData = (await result.json()) as unknown as IAlphabetChart;

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

            setIsLoading(false);
        });
    }, [alphabet, baseMediaUrl, endpoint, alphabetConfig]);

    if (isError) {
        return <Box>No alphabet chart</Box>;
    }

    if (isLoading) {
        return <Loading />;
    }

    if (isNullOrUndefined(alphabetConfig)) {
        return <NotFoundPresenter />;
    }

    return (
        <Box>
            <AlphabetPresenter {...alphabet} />
        </Box>
    );
};
