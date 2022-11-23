import { Button, Card, CardContent } from '@mui/material';
import { useState } from 'react';
import { FunctionalComponent } from '../../utils/types/functional-component';

import { cyclicDecrement, cyclicIncrement } from '../../utils/math';

const STARTING_INDEX = 0;

interface CarouselProps<T> {
    propsForItems: T[];
    Presenter: FunctionalComponent<T>;
}

// TODO We may want a unit test of this component
export const Carousel = <T,>({ propsForItems, Presenter }: CarouselProps<T>) => {
    const [currentIndex, setIndex] = useState(STARTING_INDEX);

    const numberOfItems = propsForItems.length;

    if (numberOfItems === 0) return <p>No Data</p>;

    const propsForSelectedItem = propsForItems[currentIndex];

    return (
        <Card>
            <CardContent>
                <div>
                    <Presenter {...propsForSelectedItem} />
                </div>
                <div>
                    <Button
                        disableRipple={true}
                        onClick={(_) => setIndex(cyclicDecrement(currentIndex, numberOfItems))}
                    >
                        {' '}
                        Back
                    </Button>
                    <Button
                        disableRipple={true}
                        onClick={(_) => setIndex(cyclicIncrement(currentIndex, numberOfItems))}
                    >
                        Next{' '}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
