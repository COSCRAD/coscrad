import { IAlphabetCard } from '@coscrad/api-interfaces';
import { AudioClipPlayer } from '@coscrad/media-player';
import { Box, Card, CardMedia, Typography } from '@mui/material';
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
        <Box margin={0} padding={0} component={'h1'} onClick={onButtonClick}>
            {letter}
        </Box>
    );

    const PlayWordButton = ({ onButtonClick }) => (
        <Box
            fontWeight={100}
            margin={0}
            sx={{ paddingBottom: 1.5, paddingTop: 0.5 }}
            component={'h1'}
            onClick={onButtonClick}
        >
            {word}
        </Box>
    );

    const cardStyle = {
        background: '#ffff',
        border: '2.5px solid black',
        width: { xs: '100%', sm: '400px', md: '400px', lg: '400px' },
        margin: '0 auto',
        borderRadius: 10,
    };

    const imageStyle = {
        width: '100%',
        height: 'auto',
        maxHeight: { xs: '183px', sm: '163px', md: '170px', lg: '160px' },
        objectFit: 'contain',
        cursor: 'pointer',
    };

    const ClickableImageForThisWord = ({ onButtonClick }) => (
        <CardMedia
            loading="eager"
            component="img"
            image={standalone_image}
            alt={word}
            height={140}
            sx={imageStyle}
            onClick={onButtonClick}
        />
    );

    return (
        <Box>
            <Typography variant="h2">Alphabet</Typography>
            <Card sx={cardStyle}>
                <Box sx={{ cursor: 'pointer' }} ml={8} pt={1} pb={1}>
                    <AudioClipPlayer
                        audioUrl={letter_audio}
                        UserDefinedPlayButton={PlayLetterButton}
                    />
                </Box>
                <Box>
                    <AudioClipPlayer
                        audioUrl={word_audio}
                        UserDefinedPlayButton={ClickableImageForThisWord}
                    />
                </Box>

                <Box sx={{ cursor: 'pointer' }} textAlign={'center'}>
                    <AudioClipPlayer audioUrl={word_audio} UserDefinedPlayButton={PlayWordButton} />
                </Box>
            </Card>
        </Box>
    );
};
