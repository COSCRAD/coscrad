import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Box, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';

interface ResourceNavLinkProps {
    internalLink: string;
}

export const ResourceNavLink = ({ internalLink: linkURL }: ResourceNavLinkProps): JSX.Element => (
    <Box sx={{ pl: 8 }}>
        <Link to={linkURL}>
            <IconButton aria-label="navigate to resource" sx={{ ml: 0.5 }}>
                <ArrowForwardIosIcon
                    color="primary"
                    sx={{ fontSize: { xs: '30px', sm: '40px', md: '50px' } }}
                />
            </IconButton>
        </Link>
    </Box>
);
