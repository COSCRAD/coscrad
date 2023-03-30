import { Box, Link, Tooltip, Typography } from '@mui/material';

export const MAXIMUM_NUMBER_OF_LINK_CHARACTERS = 30;

interface ExternalLinkProps {
    url: string;
}

export const ExternalLinkPresenter = ({ url }: ExternalLinkProps): JSX.Element => {
    const displayURL =
        url.length > MAXIMUM_NUMBER_OF_LINK_CHARACTERS
            ? `${url.substring(0, MAXIMUM_NUMBER_OF_LINK_CHARACTERS)}...`
            : url;

    return (
        <Box mb={1}>
            <Typography component={'span'} sx={{ fontWeight: 'bold' }}>
                External Link:&nbsp;
            </Typography>
            <Tooltip title={url}>
                <Link href={url} target="_blank" rel="noreferrer" underline="none">
                    {displayURL}
                </Link>
            </Tooltip>
        </Box>
    );
};
