import {
    IBibliographicCitationViewModel,
    IBookBibliographicCitationData,
    ResourceType,
} from '@coscrad/api-interfaces';
import {
    ExternalLinkPresenter,
    MultiplePropertyPresenter,
    PropertyLabels,
    SinglePropertyPresenter,
} from '../../../utils/generic-components';
import { ResourceDetailFullViewPresenter } from '../../../utils/generic-components/presenters/detail-views';
import { CreatorsPresenter } from './shared/creators-presenter';

export const BookBibliographicCitationDetailFullViewPresenter = ({
    id,
    data,
    contributions,
    name,
}: IBibliographicCitationViewModel<IBookBibliographicCitationData>): JSX.Element => {
    const { creators, url } = data;

    const keysAndLabels: PropertyLabels<IBookBibliographicCitationData> = {
        abstract: 'Abstract',
        publisher: 'Publisher',
        place: 'Place',
        numberOfPages: 'Pages',
        year: 'Year',
        isbn: 'ISBN',
    };

    return (
        <ResourceDetailFullViewPresenter
            name={name}
            id={id}
            type={ResourceType.bibliographicCitation}
            contributions={contributions}
        >
            <SinglePropertyPresenter display="Citation Type" value="Book" />
            <CreatorsPresenter creators={creators} />
            <MultiplePropertyPresenter keysAndLabels={keysAndLabels} data={data} />
            <ExternalLinkPresenter url={url} />
        </ResourceDetailFullViewPresenter>
    );
};
