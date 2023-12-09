import { styled } from '@mui/material';
import { TimeRangeSelection } from './audio-annotator-prototype';
import { RangeBar } from './media-range-bar';

const WAVE_FORM_URL = 'https://guujaaw.info/images/audio-wave-form.png';

const TrackBox = styled('div')({
    position: 'relative',
    marginBottom: '2px',
    boxSizing: 'border-box',
    borderBottom: '2px dotted #ccc',
});

const WaveForm = styled('div')({
    backgroundImage: `url(${WAVE_FORM_URL})`,
    width: '100%',
    height: '100%',
    backgroundSize: 'auto 30px',
    backgroundBlendMode: 'lighten',
    display: 'block',
});

interface TrackProps {
    width: number;
    height: number;
    mediaDuration: number;
    timeRangeSelection: TimeRangeSelection;
}

export const Track = ({
    width,
    height,
    mediaDuration,
    timeRangeSelection,
}: TrackProps): JSX.Element => {
    const { inPointMilliseconds, outPointMilliseconds } = timeRangeSelection;

    return (
        <TrackBox
            sx={{
                width: `${width}px`,
                height: `${height}px`,
            }}
        >
            <RangeBar
                key={inPointMilliseconds}
                mediaDuration={mediaDuration}
                inPointMilliseconds={inPointMilliseconds}
                outPointMilliseconds={outPointMilliseconds}
            />
            <WaveForm />
        </TrackBox>
    );
};
