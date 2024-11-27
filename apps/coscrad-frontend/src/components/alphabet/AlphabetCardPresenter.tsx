import { IAlphabetCard } from '@coscrad/api-interfaces';
import { AudioClipPlayer } from '@coscrad/media-player';
import { Box, Card, CardContent, CardMedia, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Loading } from '../loading';

type AlphabetCardPresenterProps = IAlphabetCard;

export const AlphabetCardPresenter = ({
    letter,
    word,
    letter_audio,
    word_audio,
    standalone_image,
}: AlphabetCardPresenterProps): JSX.Element => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const image = new Image();

        image.src = standalone_image;

        image.onload = () => {
            setIsLoading(false);
        };
    }, [standalone_image]);

    if (isLoading) return <Loading />;

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

    const ClickableImageForThisWord = ({ onButtonClick }) => (
        <CardMedia
            loading="eager"
            component="img"
            height="auto"
            image={standalone_image}
            alt={'alt'}
            title={word}
            sx={{ objectFit: 'cover' }}
            onClick={onButtonClick}
        />
    );

    return (
        <Card>
            <CardContent>
                <AudioClipPlayer audioUrl={letter_audio} UserDefinedPlayButton={PlayLetterButton} />
                <AudioClipPlayer
                    audioUrl={word_audio}
                    UserDefinedPlayButton={ClickableImageForThisWord}
                />
                <AudioClipPlayer audioUrl={word_audio} UserDefinedPlayButton={PlayWordButton} />
            </CardContent>
        </Card>
    );
};
