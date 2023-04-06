import {
    IBibliographicReferenceViewModel,
    IBookBibliographicReferenceData,
    ResourceType,
} from '@coscrad/api-interfaces';
import {
    ExternalLinkPresenter,
    MultiplePropertyPresenter,
    PropertyLabels,
    SinglePropertyPresenter,
} from '../../../utils/generic-components/';
import { ResourceDetailFullViewPresenter } from '../../../utils/generic-components/presenters/detail-views';
import { CreatorsPresenter } from './shared/creators-presenter';

export const BookBibliographicReferenceDetailFullViewPresenter = ({
    id,
    data,
}: IBibliographicReferenceViewModel<IBookBibliographicReferenceData>): JSX.Element => {
    const { title, creators, url } = data;

    /**
     * TODO: render `year` and `numberOfPages` as strings (for now it's a hack in
     * multiple-property-presenter)
     */
    const keysAndLabels: PropertyLabels<IBookBibliographicReferenceData> = {
        abstract: 'Abstract',
        year: 'Year',
        publisher: 'Publisher',
        place: 'Place',
        numberOfPages: 'Pages',
        isbn: 'ISBN',
    };

    // Temporary workaround until `name` is on IBaseViewModel
    const name = title;

    return (
        <ResourceDetailFullViewPresenter
            name={name}
            id={id}
            type={ResourceType.bibliographicReference}
        >
            <SinglePropertyPresenter display="Reference Type" value="Court Case" />
            <CreatorsPresenter creators={creators} />
            <MultiplePropertyPresenter keysAndLabels={keysAndLabels} data={data} />
            <ExternalLinkPresenter url={url} />
        </ResourceDetailFullViewPresenter>
    );
};
