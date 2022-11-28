import {
    IBibliographicReferenceViewModel,
    IBookBibliographicReferenceData,
} from '@coscrad/api-interfaces';
import { Card, CardContent, CardHeader, Divider } from '@mui/material';

const isNullOrUndefined = (input): boolean => input == null || typeof input === 'undefined';

export const BookBibliographicReferenceDetailThumbnailPresenter = ({
    id,
    data: { title, numberOfPages, year },
}: IBibliographicReferenceViewModel<IBookBibliographicReferenceData>): JSX.Element => (
    <Card>
        <CardHeader title="Book Bibliographic Reference"></CardHeader>
        <CardContent>
            <div data-testid={id}>
                {title}
                <Divider />
                <br />
                {/* TODO We should have an `OptionalProperty` helper */}
                {!isNullOrUndefined(numberOfPages) && <div>{numberOfPages} pages</div>}
                {!isNullOrUndefined(year) && <div>({year})</div>}
            </div>
        </CardContent>
    </Card>
);
