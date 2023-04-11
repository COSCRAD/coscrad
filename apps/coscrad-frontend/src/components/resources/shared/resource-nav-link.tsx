import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Box, IconButton, SxProps, Theme } from '@mui/material';
import { Link } from 'react-router-dom';

interface ResourceNavLinkProps {
    internalLink: string;
    /**
     * Note: iconSx is a temporary workaround, we may need more than one
     * component to display the resource navigation link depending on context
     */
    iconSx: SxProps<Theme>;
}

export const ResourceNavLink = ({
    internalLink: linkURL,
    iconSx,
}: ResourceNavLinkProps): JSX.Element => (
    <Box sx={{ pl: 8 }}>
        <Link to={linkURL}>
            <IconButton aria-label="navigate to resource" sx={{ ml: 0.5 }}>
                <ArrowForwardIosIcon sx={iconSx} />
            </IconButton>
        </Link>
    </Box>
);
