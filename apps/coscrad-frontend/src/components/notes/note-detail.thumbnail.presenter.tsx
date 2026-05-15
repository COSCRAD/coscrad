import { AggregateType, INoteViewModel } from '@coscrad/api-interfaces';
import { Card, CardContent, CardHeader } from '@mui/material';
import { buildDataAttributeForAggregateDetailComponent } from '../../utils/generic-components/presenters/detail-views/build-data-attribute-for-aggregate-detail-component';

export const NoteDetailThumbnailPresenter = ({ id, note }: INoteViewModel) => (
    <div data-testid={buildDataAttributeForAggregateDetailComponent(AggregateType.note, id)}>
        <Card>
            <CardHeader title={'Note'}></CardHeader>
            <CardContent>{note.original.text}</CardContent>
        </Card>
    </div>
);
