import { HasId } from '@coscrad/api-interfaces';
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { CellRenderer } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/types';

export const renderAggregateIdCell: CellRenderer<HasId> = ({ id }: HasId) => (
    /**
     * We would prefer to simply look for the link instead of a test ID. The issue,
     * e.g., in Photographs is that there's both the VIEW link and the thumbnail image is also hyperlinked so that
     * ```ts
     * cy.get([href="/Resources/Photographs/${photographId}"]).click();
     * ```
     * retrieves both links and cypress complains. If we go with a Button,
     * we could use that as an additional criteria to locate the right link,
     * but that would create problems if we later got rid of the button.
     */
    <Link data-testid={id} to={id}>
        <Button variant="outlined">VIEW</Button>
    </Link>
);
