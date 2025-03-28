import { HasId } from '@coscrad/api-interfaces';
import { Link } from 'react-router-dom';
import { CellRenderer } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/types';

export const renderAggregateIdCell: CellRenderer<HasId> = ({ id }: HasId) => (
    <Link data-testid={id} to={id}>
        VIEW
    </Link>
);
