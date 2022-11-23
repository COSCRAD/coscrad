import { IBookViewModel, IDetailQueryResult } from '@coscrad/api-interfaces';
import { Card, CardContent } from '@mui/material';
import { BookReader } from './pages';

export const BookDetailFullViewPresenter = ({
    data: { id, pages, title, subtitle, author, publicationDate },
}: IDetailQueryResult<IBookViewModel>): JSX.Element => {
    return (
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
                        <BookReader pages={pages} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
