import {
    BibliographicReferenceType,
    IBibliographicReferenceViewModel,
    IBookBibliographicReferenceData,
    IValueAndDisplay,
    ResourceType,
} from '@coscrad/api-interfaces';
import { SinglePropertyPresenter } from '../../../utils/generic-components';
import { ResourceDetailFullViewPresenter } from '../../../utils/generic-components/presenters/detail-views';
import { buildValueAndDisplay } from './shared';

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

    const name = title;

    return (
        <ResourceDetailFullViewPresenter
            name={name}
            id={id}
            type={ResourceType.bibliographicReference}
        >
            <SinglePropertyPresenter display="Title" value={title} />
            <SinglePropertyPresenter
                display="Reference Type"
                value={BibliographicReferenceType.book}
            />
            {labelsAndValues
                .filter(({ value }) => value !== null && typeof value !== 'undefined')
                .map((valueAndDisplay) => (
                    <SinglePropertyPresenter {...valueAndDisplay} key={valueAndDisplay.display} />
                ))}
        </ResourceDetailFullViewPresenter>
    );
};
