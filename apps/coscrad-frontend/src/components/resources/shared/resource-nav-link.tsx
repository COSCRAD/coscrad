import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { IconButton } from '@mui/material';
import { Link } from 'react-router-dom';

interface ResourceNavLinkProps {
    linkURL: string;
}

export const ResourceNavLink = ({ linkURL }: ResourceNavLinkProps): JSX.Element => (
    <Link to={linkURL}>
        <IconButton aria-label="navigate to resource" sx={{ ml: 0.5 }}>
            <ArrowForwardIosIcon />
        </IconButton>
    </Link>
);
