import { styled } from '@mui/material';
import { Link } from 'react-router-dom';

interface PhotographLinkProps {
    id: string;
    url: string;
}

const StyledPhotograph = styled('img')({
    width: '90px',
    height: 'auto',
    borderRadius: '6px',
    border: '0px',
});

export const PhotographLink = ({ id, url }: PhotographLinkProps): JSX.Element => (
    <Link to={id}>
        <StyledPhotograph src={url} alt={id} />
    </Link>
);
