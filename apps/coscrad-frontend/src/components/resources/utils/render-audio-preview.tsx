import { PlayArrowRounded } from '@mui/icons-material';
import { Button } from '@mui/material';
import { CellRenderer } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/types';

export interface HasUrl {
    url: string;
}

export const renderAggregateUrlCell: CellRenderer<HasUrl> = ({ url }: HasUrl) => (
    <Button>
        {url}
        <PlayArrowRounded />
    </Button>
);
