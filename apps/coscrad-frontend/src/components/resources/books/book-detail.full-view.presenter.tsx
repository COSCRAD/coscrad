import {
    AggregateType,
    IBookViewModel,
    ICategorizableDetailQueryResult,
} from '@coscrad/api-interfaces';
import { Card, CardContent } from '@mui/material';
import { buildDataAttributeForAggregateDetailComponent } from '../../../utils/generic-components/presenters/detail-views/build-data-attribute-for-aggregate-detail-component';
import { BookReader } from './pages';

export const BookDetailFullViewPresenter = ({
    id,
    pages,
    title,
    subtitle,
    author,
    publicationDate,
}: ICategorizableDetailQueryResult<IBookViewModel>): JSX.Element => {
    return (
        <div data-testid={buildDataAttributeForAggregateDetailComponent(AggregateType.book, id)}>
            <Card>
                <CardContent>
                    <div>
                        <h1>{title}</h1>
                        {subtitle && <h3>{subtitle}</h3>}
                        <strong>by</strong> {author}
                        <br />
                        {publicationDate && (
                            <div>
                                <strong>published</strong> {publicationDate}
                            </div>
                        )}
                    </div>
                    <div>
                        <BookReader pages={pages} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
