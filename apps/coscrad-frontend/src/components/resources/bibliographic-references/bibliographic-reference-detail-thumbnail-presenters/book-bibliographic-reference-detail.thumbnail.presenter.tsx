import {
    IBibliographicReferenceViewModel,
    IBookBibliographicReferenceData,
} from '@coscrad/api-interfaces';
import { Card, CardContent, CardHeader, Divider } from '@mui/material';

export const BookBibliographicReferenceDetailThumbnailPresenter = ({
    data: { title, numberOfPages, year },
}: IBibliographicReferenceViewModel<IBookBibliographicReferenceData>): JSX.Element => (
    <Card>
        <CardHeader title="Book Bibliographic Reference"></CardHeader>
        <CardContent>
            <div>
                {title}
                <Divider />
                <br />
                {numberOfPages && <div>{numberOfPages} pages</div>}
                {year && <div>({year})</div>}
            </div>
        </CardContent>
    </Card>
);
