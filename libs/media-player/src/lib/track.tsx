import { styled } from '@mui/material';

const WAVE_FORM_URL = 'https://guujaaw.info/images/audio-wave-form.png';

const TrackContainer = styled('div')({
    position: 'relative',
    borderRadius: '5px',
    marginBottom: '2px',
    boxSizing: 'border-box',
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
    width: string;
    height: string;
    trackColor: string;
}

export const Track = ({ width, height, trackColor }: TrackProps): JSX.Element => {
    return (
        <TrackContainer sx={{ width: width, height: height, backgroundColor: trackColor }}>
            <WaveForm />
        </TrackContainer>
    );
};
