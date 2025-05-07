import { MIMEType } from '@coscrad/api-interfaces';
import { AudioPlayer } from '@coscrad/media-player';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import ArticleIcon from '@mui/icons-material/Article';
import TranscribeIcon from '@mui/icons-material/Transcribe';
import { Box, IconButton, Paper, Typography } from '@mui/material';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { AdditionalMaterialItem } from '../../configurable-front-matter/data/configurable-content-schema';
import { ErrorDisplay } from '../error-display/error-display';
import { NotFoundPresenter } from '../not-found';

const MediaItemPresenter = ({
    url,
    mimeType,
    name,
    description,
}: AdditionalMaterialItem['media']): JSX.Element => {
    if (![MIMEType.mp3, MIMEType.wav, MIMEType.audioOgg].includes(mimeType)) {
        return <ErrorDisplay code={500} message={`Unsupported media item type: ${MIMEType}`} />;
    }

    return (
        <Box component={'div'}>
            <Typography variant={'h3'} color={'primary.main'}>
                <IconButton>
                    <TranscribeIcon
                        fontSize="large"
                        sx={{ color: 'secondary.main', verticalAlign: 'middle' }}
                    />
                </IconButton>{' '}
                {name}
            </Typography>
            <Typography variant={'body1'}>{description}</Typography>
            <AudioPlayer audioUrl={url} />
        </Box>
    );
};

const PdfPresenter = ({ url, name, description }: AdditionalMaterialItem['pdf']): JSX.Element => {
    return (
        <Box component={'div'}>
            <Typography variant={'h3'}>
                <Box
                    component={'a'}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    color={'primary.main'}
                    textTransform={'capitalize'}
                >
                    <IconButton>
                        <ArticleIcon
                            fontSize="large"
                            sx={{ color: 'secondary.main', verticalAlign: 'middle' }}
                        />
                    </IconButton>
                    {name}
                </Box>
            </Typography>

            <Typography variant={'body1'} color={'text.secondary'}>
                {description}
            </Typography>
        </Box>
    );
};

export const AdditionalMaterials = (): JSX.Element => {
    const { additionalMaterials } = useContext(ConfigurableContentContext);

    if (additionalMaterials.length === 0) return <NotFoundPresenter />;

    return (
        <>
            {additionalMaterials
                .filter(({ pdf, media }) => !isNullOrUndefined(pdf) || !isNullOrUndefined(media))
                .map(({ pdf, media }) => (
                    <Box key={media.name} p={2} component={Paper}>
                        {isNullOrUndefined(media) ? null : <MediaItemPresenter {...media} />}
                        {isNullOrUndefined(pdf) ? null : <PdfPresenter {...pdf} />}
                    </Box>
                ))}
        </>
    );
};
