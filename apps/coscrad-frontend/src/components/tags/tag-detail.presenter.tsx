import { ITagViewModel } from '@coscrad/api-interfaces';
import { Card, CardContent, CardHeader, Divider } from '@mui/material';
import { CategorizablesOfMultipleTypeContainer } from '../higher-order-components';
import { thumbnailCategorizableDetailPresenterFactory } from '../resources/factories/thumbnail-categorizable-detail-presenter-factory';

/**
 * TODO[https://www.pivotaltracker.com/story/show/183618856]
 * We need to expose Tag commands through Tag queries.
 */
export const TagDetailPresenter = ({ id, label, members }: ITagViewModel): JSX.Element => (
    <div data-testid={id}>
        <Card>
            <CardHeader title={label} />
            <Divider />
            <CardContent>
                <CategorizablesOfMultipleTypeContainer
                    members={members}
                    detailPresenterFactory={thumbnailCategorizableDetailPresenterFactory}
                    heading="Tagged Resources"
                />
            </CardContent>
        </Card>
    </div>
);
