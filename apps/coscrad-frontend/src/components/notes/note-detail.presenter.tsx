import { INoteViewModel } from '@coscrad/api-interfaces';
import { Card, CardContent, CardHeader } from '@mui/material';
import { CategorizablesOfMultipleTypeContainer } from '../higher-order-components';
import { thumbnailCategorizableDetailPresenterFactory } from '../resources/factories/thumbnail-categorizable-detail-presenter-factory';

export const NoteDetailPresenter = ({ id, note: text, connectedResources }: INoteViewModel) => (
    <div data-testid={id}>
        <Card>
            <CardHeader title={'Note'}></CardHeader>
            <CardContent>{text}</CardContent>
        </Card>
        <CategorizablesOfMultipleTypeContainer
            detailPresenterFactory={thumbnailCategorizableDetailPresenterFactory}
            members={connectedResources.map(({ compositeIdentifier }) => compositeIdentifier)}
            heading={'Connected Resources'}
        />
    </div>
);
