import { styled } from '@mui/material';
import { RangeBar } from './media-range-bar';

const WAVE_FORM_URL = 'https://guujaaw.info/images/audio-wave-form.png';

const TrackBox = styled('div')({
    position: 'relative',
    marginBottom: '2px',
    boxSizing: 'border-box',
    borderBottom: '1px dotted #ccc',
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
    selectionStartMilliseconds: number;
    selectionEndMilliseconds: number;
}

export const Track = ({
    width,
    height,
    mediaDuration,
    selectionStartMilliseconds,
    selectionEndMilliseconds,
}: TrackProps): JSX.Element => {
    return (
        <TrackBox
            sx={{
                width: `${width}px`,
                height: `${height}px`,
            }}
        >
            <RangeBar
                key={selectionStartMilliseconds}
                mediaDuration={mediaDuration}
                selectionStartMilliseconds={selectionStartMilliseconds}
                selectionEndMilliseconds={selectionEndMilliseconds}
            />
            <WaveForm />
        </TrackBox>
    );
};
