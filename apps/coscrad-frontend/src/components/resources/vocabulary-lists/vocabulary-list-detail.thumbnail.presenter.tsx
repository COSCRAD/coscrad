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
    data: { id, name, nameEnglish, entries },
}: IDetailQueryResult<IVocabularyListViewModel>): JSX.Element => (
    <div data-testid={id}>
        <Link to={`/${routes.resources.ofType(ResourceType.vocabularyList).detail(id)}`}>
            <Card>
                <CardHeader title={formatBilingualText(name, nameEnglish)}></CardHeader>

                <CardContent>
                    <Divider />
                    Number of Entries: {entries.length}
                </CardContent>
            </Card>
        </Link>
    </div>
);
