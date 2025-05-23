import {
    AggregateType,
    ICategorizableDetailQueryResult,
    IVocabularyListViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { Card, CardContent, Divider } from '@mui/material';
import { Link } from 'react-router-dom';
import { routes } from '../../../app/routes/routes';
import { buildDataAttributeForAggregateDetailComponent } from '../../../utils/generic-components/presenters/detail-views/build-data-attribute-for-aggregate-detail-component';
import { ExpandableMultilingualTextPresenter } from '../../../utils/generic-components/presenters/expandable-multilingual-text-presenter';

export const VocabularyListDetailThumbnailPresenter = ({
    id,
    name,
    entries,
}: ICategorizableDetailQueryResult<IVocabularyListViewModel>): JSX.Element => (
    <div
        data-testid={buildDataAttributeForAggregateDetailComponent(
            AggregateType.vocabularyList,
            id
        )}
    >
        ID: {id}
        <Link to={`/${routes.resources.ofType(ResourceType.vocabularyList).detail(id)}`}>
            <Card>
                <CardContent>
                    <ExpandableMultilingualTextPresenter text={name} />
                    <Divider />
                    Number of Entries: {entries.length}
                </CardContent>
            </Card>
        </Link>
    </div>
);
