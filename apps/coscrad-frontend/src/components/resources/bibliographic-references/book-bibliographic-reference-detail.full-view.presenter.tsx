import {
    IBibliographicReferenceViewModel,
    IBookBibliographicReferenceData,
    IValueAndDisplay,
} from '@coscrad/api-interfaces';
import { BibliographicReferenceCard, buildValueAndDisplay } from './shared';

export const BookBibliographicReferenceDetailFullViewPresenter = ({
    id,
    data,
}: IBibliographicReferenceViewModel<IBookBibliographicReferenceData>): JSX.Element => {
    const { title, abstract, year, publisher, place, url, numberOfPages, isbn } = data;

    const labelsAndValues: IValueAndDisplay<unknown>[] = (
        [
            [abstract, 'Abstract'],
            [year.toString(), 'Year'],
            [publisher, 'Publisher'],
            [place, 'Place'],
            // TODO format this as a link
            [url, 'External Link'],
            [numberOfPages.toString(), 'Page Count'],
            [isbn, 'ISBN'],
            // TODO Expose creators
        ] as [string, string][]
    ).map(buildValueAndDisplay);

    return (
        <BibliographicReferenceCard
            id={id}
            header="Book Bibliographic Reference"
            title={title}
            labelsAndValues={labelsAndValues}
        />
    );
};
