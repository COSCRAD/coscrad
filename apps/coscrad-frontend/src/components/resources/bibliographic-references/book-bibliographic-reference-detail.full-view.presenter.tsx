import {
    IBibliographicReferenceViewModel,
    IBookBibliographicReferenceData,
    IValueAndDisplay,
} from '@coscrad/api-interfaces';
import { Card, CardContent, CardHeader, Divider } from '@mui/material';
import { SinglePropertyPresenter } from '../../../utils/generic-components';

export const BookBibliographicReferenceDetailFullViewPresenter = ({
    id,
    data,
}: IBibliographicReferenceViewModel<IBookBibliographicReferenceData>): JSX.Element => {
    const { title, abstract, year, publisher, place, url, numberOfPages, isbn } = data;

    const labelsAndValues: IValueAndDisplay<unknown>[] = (
        [
            [abstract, 'Abstract'],
            [year, 'Year'],
            [publisher, 'Publisher'],
            [place, 'Place'],
            // TODO format this as a link
            [url, 'External Link'],
            [numberOfPages, 'Page Count'],
            [isbn, 'ISBN'],
            // TODO Expose creators
        ] as const
    )
        // Do not present optional values
        .filter(([value, _]) => value !== null && typeof value !== 'undefined')
        .map(([value, display]) => ({
            value,
            display,
        }));

    return (
        <Card>
            <CardHeader title="Book Bibliographic Reference"></CardHeader>
            <CardContent>
                <div data-testid={id}>
                    {title}
                    <Divider />
                    <br />
                    {labelsAndValues
                        .filter(({ value }) => value !== null && typeof value !== 'undefined')
                        .map((valueAndDisplay) => (
                            <SinglePropertyPresenter {...valueAndDisplay} />
                        ))}
                </div>
            </CardContent>
        </Card>
    );
};
