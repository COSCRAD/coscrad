import {
    IBibliographicCitationViewModel,
    IBookBibliographicCitationData,
    ResourceType,
} from '@coscrad/api-interfaces';
import {
    MultiplePropertyPresenter,
    PropertyLabels,
    ResourceDetailThumbnailPresenter,
    SinglePropertyPresenter,
} from '../../../../utils/generic-components';

export const BookBibliographicCitationDetailThumbnailPresenter = ({
    id,
    data,
}: IBibliographicCitationViewModel<IBookBibliographicCitationData>): JSX.Element => {
    const { title } = data;
    const name = title;

    const keysAndLabels: PropertyLabels<IBookBibliographicCitationData> = {
        numberOfPages: 'Pages',
        year: 'Year',
    };

    return (
        <ResourceDetailThumbnailPresenter
            id={id}
            name={name}
            type={ResourceType.bibliographicCitation}
        >
            <SinglePropertyPresenter display="Citation Type" value="Book" />
            <MultiplePropertyPresenter keysAndLabels={keysAndLabels} data={data} />
        </ResourceDetailThumbnailPresenter>
    );
};
