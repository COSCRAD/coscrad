import { HasId } from '@coscrad/api-interfaces';
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { CellRenderer } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/types';

export const renderAggregateIdCell: CellRenderer<HasId> = ({ id }: HasId) => (
    <Link data-testid={id} to={id}>
        <Button variant="outlined">VIEW</Button>
    </Link>
);
