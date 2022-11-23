import { IBookViewModel, IDetailQueryResult, ResourceType } from '@coscrad/api-interfaces';
import { Card, CardContent } from '@mui/material';
import { Link } from 'react-router-dom';
import { routes } from '../../../app/routes/routes';

export const BookDetailThumbnailPresenter = ({
    data: { id, pages, title, subtitle, author, publicationDate },
}: IDetailQueryResult<IBookViewModel>): JSX.Element => {
    return (
        // TODO We may want to automate the link wrapping because it's easy to forget
        <Link to={`/${routes.resources.ofType(ResourceType.book).detail(id)}`}>
            <div data-testid={id}>
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
                            <strong>page count:</strong> {pages.length}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Link>
    );
};
