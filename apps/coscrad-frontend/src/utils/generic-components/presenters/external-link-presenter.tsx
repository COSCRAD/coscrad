import { Box, Link, Tooltip, Typography } from '@mui/material';
import { shortenString } from '../../string-processor/shorten-string';

export const MAXIMUM_NUMBER_OF_LINK_CHARACTERS = 30;

interface ExternalLinkProps {
    url: string;
}

export const ExternalLinkPresenter = ({ url }: ExternalLinkProps): JSX.Element => {
    return (
        <Box mb={1}>
            <Typography component={'span'} sx={{ fontWeight: 'bold' }}>
                External Link:&nbsp;
            </Typography>
            <Tooltip title={url}>
                <Link href={url} target="_blank" rel="noreferrer" underline="none">
                    {shortenString(url, MAXIMUM_NUMBER_OF_LINK_CHARACTERS)}
                </Link>
            </Tooltip>
        </Box>
    );
};
