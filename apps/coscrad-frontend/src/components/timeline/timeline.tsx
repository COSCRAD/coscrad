import { Box, styled } from '@mui/material';
import { EDITOR_SOUND_BAR_HEIGHT, ZOOM_FACTOR } from './constants';
import { RangeBar } from './range-bar';

const WAVE_FORM_URL = 'https://guujaaw.info/images/audio-wave-form.png';

const WaveForm = styled('div')({
    backgroundImage: `url(${WAVE_FORM_URL})`,
    width: '100%',
    height: 'auto',
    backgroundSize: 'auto 30px',
    backgroundBlendMode: 'lighten',
    display: 'block',
    position: 'absolute',
});

export type TimeRangeSeconds = {
    inPointSeconds: number;
    outPointSeconds: number;
};

export interface TimeRangeClip {
    timeRangeSeconds: TimeRangeSeconds;
    label: React.ReactNode;
}

interface TimelineProps {
    durationSeconds: number;
    timeRangeClips: TimeRangeClip[];
    name: string;
}

export const Timeline = ({ timeRangeClips, durationSeconds, name }: TimelineProps) => {
    const scrolledTrackLength = durationSeconds * ZOOM_FACTOR;

    return (
        <Box
            data-testid={`timeline:${name}`}
            sx={{
                width: '100%',
                height: `${EDITOR_SOUND_BAR_HEIGHT + 10}px`,
                border: '1px solid red',
                overflowX: 'scroll',
            }}
        >
            <Box
                data-testid="scrollable-timeline"
                sx={{
                    width: `${scrolledTrackLength}px`,
                    height: `${EDITOR_SOUND_BAR_HEIGHT + 4}px`,
                    backgroundColor: '#444',
                }}
            >
                {timeRangeClips.map((timeRangeClip) => (
                    <RangeBar timeRangeClip={timeRangeClip} durationSeconds={durationSeconds} />
                ))}
                <WaveForm />
            </Box>
        </Box>
    );
};
