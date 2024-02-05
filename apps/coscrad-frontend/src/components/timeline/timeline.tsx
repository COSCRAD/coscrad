import { Box, Slider } from '@mui/material';

export interface TimelineMark {
    value: number;
    label: React.ReactNode;
}

interface TimelineProps {
    defaultValue: number;
    step: number;
    min: number;
    max: number;
    marks: TimelineMark[];
    name: string;
}

export const Timeline = ({ marks, defaultValue, step, min, max, name }: TimelineProps) => {
    return (
        <div data-testid={`timeline:${name}`}>
            <Box sx={{ width: '1000px' }}>
                max: {max}
                Marks: {JSON.stringify(marks)}
                <Slider
                    aria-label={name}
                    defaultValue={defaultValue}
                    step={step}
                    min={min}
                    max={max}
                    valueLabelDisplay="auto"
                    marks={marks}
                />
            </Box>
        </div>
    );
};
