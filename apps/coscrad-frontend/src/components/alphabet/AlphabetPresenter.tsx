import { IAlphabetChart } from '@coscrad/api-interfaces';
import { Box } from '@mui/material';
import { Carousel } from '../higher-order-components/carousel';
import { AlphabetCardPresenter } from './AlphabetCardPresenter';

type AlphabetPresenterProps = IAlphabetChart;

export const AlphabetPresenter = ({
    data: { alphabet_cards: cards },
}: AlphabetPresenterProps): JSX.Element => {
    return (
        <Box>
            <Carousel propsForItems={cards} Presenter={AlphabetCardPresenter} />
        </Box>
    );
};
