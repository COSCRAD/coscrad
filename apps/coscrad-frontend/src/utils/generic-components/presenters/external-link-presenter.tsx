import { Box, Link, Tooltip, Typography } from '@mui/material';

interface ExternalLinkProps {
    url: string;
}

export const ExternalLinkPresenter = ({ url }: ExternalLinkProps): JSX.Element => {
    const linkDisplayLength = 30;

    const displayURL =
        url.length > linkDisplayLength ? `${url.substring(0, linkDisplayLength)}...` : url;

    return (
        <Box mb={1}>
            <Typography component={'span'} sx={{ fontWeight: 'bold' }}>
                External Link:
            </Typography>
            {` `}
            <Tooltip title={url}>
                <Link href={url} target="_blank" rel="noreferrer" underline="none">
                    {displayURL}
                </Link>
            </Tooltip>
        </Box>
    );
};
