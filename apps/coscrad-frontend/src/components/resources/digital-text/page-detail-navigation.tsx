import { Box, Button } from '@mui/material';
import { cyclicDecrement, cyclicIncrement } from '../../../utils/math';

interface PageDetailNavigationProps {
    currentIndex: number;
    pagesLength: number;
    setCurrentIndex: (newIndex: number) => void;
}

export const PageDetailNavigation = ({
    currentIndex,
    pagesLength,
    setCurrentIndex,
}: PageDetailNavigationProps): JSX.Element => (
    <Box sx={{ m: 1 }}>
        <Button
            onClick={() => {
                setCurrentIndex(cyclicDecrement(currentIndex, pagesLength));
            }}
        >
            {'<< PREV'}
        </Button>{' '}
        <Button
            onClick={() => {
                setCurrentIndex(cyclicIncrement(currentIndex, pagesLength));
            }}
        >
            {'NEXT >>'}
        </Button>
    </Box>
);
