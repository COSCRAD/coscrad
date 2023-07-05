import {
    ICategorizableDetailQueryResult,
    IVocabularyListViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { Card, CardContent, Divider } from '@mui/material';
import { Link } from 'react-router-dom';
import { routes } from '../../../app/routes/routes';
import { MultilingualTextPresenter } from '../../../utils/generic-components/presenters/multilingual-text-presenter';
import { ContextProps } from '../factories/full-view-categorizable-presenter-factory';

export const VocabularyListDetailThumbnailPresenter = ({
    id,
    name,
    entries,
}: ICategorizableDetailQueryResult<IVocabularyListViewModel> & ContextProps): JSX.Element => (
    <div data-testid={id}>
        <Link to={`/${routes.resources.ofType(ResourceType.vocabularyList).detail(id)}`}>
            <Card>
                <CardContent>
                    <MultilingualTextPresenter text={name} />
                    <Divider />
                    Number of Entries: {entries.length}
                </CardContent>
            </Card>
        </Link>
    </div>
);
