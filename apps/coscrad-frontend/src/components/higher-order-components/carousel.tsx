import { Box, Button } from '@mui/material';
import { useState } from 'react';
import { FunctionalComponent } from '../../utils/types/functional-component';

import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { cyclicDecrement, cyclicIncrement } from '../../utils/math';
import { NotFoundPresenter } from '../not-found';

const STARTING_INDEX = 0;

interface CarouselProps<T> {
    propsForItems: T[];
    Presenter: FunctionalComponent<T>;
}

// TODO We may want a unit test of this component
export const Carousel = <T,>({ propsForItems, Presenter }: CarouselProps<T>) => {
    const [currentIndex, setIndex] = useState(STARTING_INDEX);

    const numberOfItems = propsForItems.length;

    /**
     * This is a bit of a hack. Sometimes we use filtering behaviour for the
     * `propsForItems` outside of this component. We should find a better way to
     * manage this situation.
     */
    const indexToUse = currentIndex >= numberOfItems ? 0 : currentIndex;

    if (numberOfItems === 0) return <NotFoundPresenter></NotFoundPresenter>;

    const propsForSelectedItem = propsForItems[indexToUse];

    return (
        <Box>
            <Presenter {...propsForSelectedItem} />
            <Box sx={{ textAlign: 'center', marginTop: 2 }}>
                <Button
                    data-testid="PREV"
                    color="primary"
                    sx={{ fontSize: 20 }}
                    onClick={(_) => setIndex(cyclicDecrement(indexToUse, numberOfItems))}
                >
                    <ArrowBackIosNewIcon sx={{ fontSize: '2em' }} />
                </Button>
                <Button
                    data-testid="NEXT"
                    color="primary"
                    sx={{ fontSize: 20 }}
                    onClick={(_) => setIndex(cyclicIncrement(indexToUse, numberOfItems))}
                >
                    <ArrowForwardIosIcon sx={{ fontSize: '2em' }} />
                </Button>
            </Box>
        </Box>
    );
};
