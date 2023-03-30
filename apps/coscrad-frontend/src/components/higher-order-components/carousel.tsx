import { Button, Card, CardActions, CardContent } from '@mui/material';
import { useState } from 'react';
import { FunctionalComponent } from '../../utils/types/functional-component';

import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
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
        <Card sx={{ boxShadow: 'none' }}>
            <CardContent>
                <Presenter {...propsForSelectedItem} />
            </CardContent>
            <CardActions sx={{ display: 'inline' }}>
                <Button
                    disableRipple={true}
                    onClick={(_) => setIndex(cyclicDecrement(indexToUse, numberOfItems))}
                >
                    {' '}
                    <ArrowBackIosIcon /> Back
                </Button>
                <Button
                    disableRipple={true}
                    onClick={(_) => setIndex(cyclicIncrement(indexToUse, numberOfItems))}
                >
                    Next <ArrowForwardIosIcon />
                </Button>
            </CardActions>
        </Card>
    );
};
