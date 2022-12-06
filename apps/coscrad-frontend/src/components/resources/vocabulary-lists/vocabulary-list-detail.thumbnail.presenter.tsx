import {
    IDetailQueryResult,
    IVocabularyListViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { Card, CardContent, CardHeader, Divider } from '@mui/material';
import { Link } from 'react-router-dom';
import { routes } from '../../../app/routes/routes';
import { formatBilingualText } from './utils';

export const VocabularyListDetailThumbnailPresenter = ({
    data: { id, name, nameEnglish, entries, form },
}: IDetailQueryResult<IVocabularyListViewModel>): JSX.Element => (
    <Link to={`/${routes.resources.ofType(ResourceType.vocabularyList).detail(id)}`}>
        <Card>
            <CardHeader>
                <div data-testid={id}>{formatBilingualText(name, nameEnglish)}</div>
            </CardHeader>

            <CardContent>
                <br />
                <Divider />
                Number of Entries: {entries.length}
            </CardContent>
        </Card>
    </Link>
);
