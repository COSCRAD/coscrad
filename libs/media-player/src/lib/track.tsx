import { styled } from '@mui/material';
import { RangeBar } from './range-bar';
import { ITranscriptItem } from './video-prototype-interfaces/transcript-item.interface';

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
    participantInitials: string;
    transcriptItems: ITranscriptItem[];
}

export const Track = ({
    width,
    height,
    mediaDuration,
    participantInitials,
    transcriptItems,
}: TrackProps): JSX.Element => {
    return (
        <TrackBox
            sx={{
                width: `${width}px`,
                height: `${height}px`,
            }}
        >
            {transcriptItems
                .filter(({ speakerInitials }) => speakerInitials === participantInitials)
                .map(({ inPointMilliseconds, outPointMilliseconds }) => (
                    <RangeBar
                        key={inPointMilliseconds}
                        mediaDuration={mediaDuration}
                        inPointMilliseconds={inPointMilliseconds}
                        outPointMilliseconds={outPointMilliseconds}
                    />
                ))}
            <WaveForm />
        </TrackBox>
    );
};
