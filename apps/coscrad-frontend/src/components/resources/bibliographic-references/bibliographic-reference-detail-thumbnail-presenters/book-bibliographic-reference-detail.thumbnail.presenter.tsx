import {
    IBibliographicReferenceViewModel,
    IBookBibliographicReferenceData,
    ResourceType,
} from '@coscrad/api-interfaces';
import {
    MultiplePropertyPresenter,
    PropertyLabels,
    ResourceDetailThumbnailPresenter,
    SinglePropertyPresenter,
} from '../../../../utils/generic-components';

export const BookBibliographicReferenceDetailThumbnailPresenter = ({
    id,
    data,
}: IBibliographicReferenceViewModel<IBookBibliographicReferenceData>): JSX.Element => {
    const { title } = data;
    const name = title;

    const keysAndLabels: PropertyLabels<IBookBibliographicReferenceData> = {
        numberOfPages: 'Pages',
        year: 'Year',
    };

    return (
        <ResourceDetailThumbnailPresenter
            id={id}
            name={name}
            type={ResourceType.bibliographicReference}
        >
            <SinglePropertyPresenter display="Reference Type" value="Book" />
            <MultiplePropertyPresenter keysAndLabels={keysAndLabels} data={data} />
        </ResourceDetailThumbnailPresenter>
    );
};
