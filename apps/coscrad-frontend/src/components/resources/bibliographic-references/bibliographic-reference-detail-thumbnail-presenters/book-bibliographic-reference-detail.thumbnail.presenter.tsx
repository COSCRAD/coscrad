import {
    BibliographicReferenceType,
    IBibliographicReferenceViewModel,
    IBookBibliographicReferenceData,
    ResourceType,
} from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import {
    MultiplePropertyPresenter,
    PropertyLabels,
    ResourceDetailThumbnailPresenter,
    SinglePropertyPresenter,
} from '../../../../utils/generic-components';

interface YearPresenterProps {
    year: number;
}

const YearPresenter = ({ year }: YearPresenterProps): JSX.Element => {
    return <>{!isNullOrUndefined(year) && <>({year})</>}</>;
};

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
            <SinglePropertyPresenter
                display="Reference Type"
                value={BibliographicReferenceType.book}
            />
            <MultiplePropertyPresenter keysAndLabels={keysAndLabels} data={data} />
        </ResourceDetailThumbnailPresenter>
    );
};
