import { Link } from 'react-router-dom';
import './photograph-link.css';

interface PhotographLinkProps {
    id: string;
    url: string;
}

export const PhotographLink = ({ id, url }: PhotographLinkProps): JSX.Element => (
    <div className="photograph-link">
        <Link to={id}>
            <img src={url} />
        </Link>
    </div>
);
