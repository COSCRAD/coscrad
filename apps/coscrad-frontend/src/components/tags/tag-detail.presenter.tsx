import { IDetailQueryResult, ITagViewModel } from '@coscrad/api-interfaces';
import { Card, CardContent, CardHeader, Divider } from '@mui/material';
import { CategorizablesOfMultipleTypeContainer } from '../higher-order-components';
import { thumbnailCategorizableDetailPresenterFactory } from '../resources/factories/thumbnail-categorizable-detail-presenter-factory';

export const TagDetailPresenter = ({
    id,
    label,
    members,
}: IDetailQueryResult<ITagViewModel>): JSX.Element => (
    <div data-testid={id}>
        <Card>
            <CardHeader title={label} />
            <Divider />
            <CardContent>
                {/* TODO Move this into the container */}
                <CategorizablesOfMultipleTypeContainer
                    members={members}
                    detailPresenterFactory={thumbnailCategorizableDetailPresenterFactory}
                    heading="Tagged Resources and Notes"
                />
            </CardContent>
        </Card>
    </div>
);
