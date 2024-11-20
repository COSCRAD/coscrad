import { IAlphabetCard, IAlphabetChart } from '@coscrad/api-interfaces';
import { Box } from '@mui/material';
import { AlphabetPresenter } from './AlphabetPresenter';

const buildDummyAlphabetCard = (letter: string, sequence_number: number): IAlphabetCard => ({
    letter,
    word: `word for ${letter}`,
    sequence_number: sequence_number.toString(),
    letter_audio: `https://coscradapi.tsilhqotinlanguage.ca/api/resources/mediaItems/download/4b12031c-2416-4f2c-9fe7-1aee89d3d682`,
    word_audio: `https://coscradapi.tsilhqotinlanguage.ca/api/resources/mediaItems/download/4b12031c-2416-4f2c-9fe7-1aee89d3d682`,
    standalone_image: `https://coscradapi.tsilhqotinlanguage.ca/api/resources/mediaItems/download/6518117c-e104-4bee-bf32-a0a54fc16302`,
    card_image: `https://www.tsilhqotinlanguage.ca/${letter}-c.png`,
});

const dummyCards = [0, 1, 2, 3, 4, 5].map((index) => buildDummyAlphabetCard(`l${index}`, index));

const dummyName = 'english-alphabet';

const alphabet: IAlphabetChart = {
    data: {
        name: dummyName,
        name_english: `${dummyName} (english)`,
        poster: {
            name: '',
            url: '',
        },
        alphabet_cards: dummyCards,
    },
};

export const AlphabetPage = (): JSX.Element => {
    return (
        <Box>
            <AlphabetPresenter {...alphabet} />
        </Box>
    );
};
