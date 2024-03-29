import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Box, Link, Tooltip, Typography } from '@mui/material';
import { truncateText } from '../../string-processor/shorten-string';

const MAXIMUM_NUMBER_OF_LINK_CHARACTERS = 30;

interface ExternalLinkProps {
    url: string;
}

export const ExternalLinkPresenter = ({ url }: ExternalLinkProps): JSX.Element => {
    if (isNullOrUndefined(url) || url === '') return null;

    return (
        <Box mb={1}>
            <Typography component={'span'} sx={{ fontWeight: 'bold' }}>
                External Link:&nbsp;
            </Typography>
            <Tooltip title={url}>
                <Link href={url} target="_blank" rel="noreferrer" underline="none">
                    {truncateText(url, MAXIMUM_NUMBER_OF_LINK_CHARACTERS)}
                </Link>
            </Tooltip>
        </Box>
    );
};
