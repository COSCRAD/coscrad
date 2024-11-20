import { IAlphabetCard } from '@coscrad/api-interfaces';
import { AudioClipPlayer } from '@coscrad/media-player';
import { Box, Card, CardContent, CardMedia, Typography } from '@mui/material';

type AlphabetCardPresenterProps = IAlphabetCard;

export const AlphabetCardPresenter = ({
    letter,
    word,
    sequence_number,
    letter_audio,
    word_audio,
    standalone_image,
    card_image,
}: AlphabetCardPresenterProps): JSX.Element => {
    const PlayLetterButton = ({ onButtonClick }) => (
        <Typography variant={'h1'} component={Box} onClick={onButtonClick}>
            {letter}
        </Typography>
    );

    const PlayWordButton = ({ onButtonClick }) => (
        <Typography variant={'h1'} component={Box} onClick={onButtonClick}>
            {word}
        </Typography>
    );

    return (
        <Card>
            <CardContent>
                <AudioClipPlayer audioUrl={letter_audio} UserDefinedPlayButton={PlayLetterButton} />

                <CardMedia
                    component="img"
                    height="auto"
                    image={standalone_image}
                    alt={'alt'}
                    title={'titleasdasdsada'}
                    sx={{ objectFit: 'cover' }}
                />
                <AudioClipPlayer audioUrl={word_audio} UserDefinedPlayButton={PlayWordButton} />
            </CardContent>
        </Card>
    );
};
