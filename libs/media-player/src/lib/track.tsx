import { styled } from '@mui/material';
import { useState } from 'react';
import { RangeBar } from './range-bar';

const WAVE_FORM_URL = 'https://guujaaw.info/images/audio-wave-form.png';

const TrackBox = styled('div')({
    position: 'relative',
    marginBottom: '2px',
    boxSizing: 'border-box',
    padding: '5px',
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

const Initials = styled('div')({
    position: 'absolute',
    color: '#fff',
});

interface TrackProps {
    participantInitials: string;
    width: number;
    height: number;
}

export const Track = ({ participantInitials, width, height }: TrackProps): JSX.Element => {
    const [activeTrack, setActiveTrack] = useState();

    return (
        <TrackBox
            sx={{
                width: `${width}px`,
                height: `${height}px`,
            }}
        >
            <RangeBar />
            <Initials>{participantInitials}</Initials>
            <WaveForm />
        </TrackBox>
    );
};
