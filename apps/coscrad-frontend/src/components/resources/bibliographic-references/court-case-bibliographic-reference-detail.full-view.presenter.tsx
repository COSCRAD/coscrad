import {
    BibliographicReferenceType,
    IBibliographicReferenceViewModel,
    ICourtCaseBibliographicReferenceData,
    IValueAndDisplay,
    ResourceType,
} from '@coscrad/api-interfaces';
import { SinglePropertyPresenter } from '../../../utils/generic-components';
import { ResourceDetailFullViewPresenter } from '../../../utils/generic-components/presenters/detail-views';

export const CourtCaseBibliographicReferenceDetailFullViewPresenter = ({
    id,
    data: { caseName, abstract, dateDecided, court, url, pages },
}: IBibliographicReferenceViewModel<ICourtCaseBibliographicReferenceData>): JSX.Element => {
    const labelsAndValues: IValueAndDisplay<unknown>[] = (
        [
            [abstract, 'Abstract'],
            [dateDecided, 'Date Decided'],
            [court, 'Court'],
            // TODO format as external link
            [url, 'External Link'],
            [pages, 'Pages'],
        ] as const
    )
        // Do not present optional values
        .filter(([value, _]) => value !== null && typeof value !== 'undefined')
        .map(([value, display]) => ({
            value,
            display,
        }));

    const name = caseName;

    return (
        <ResourceDetailFullViewPresenter
            name={name}
            id={id}
            type={ResourceType.bibliographicReference}
        >
            <SinglePropertyPresenter display="Title" value={caseName} />
            <SinglePropertyPresenter
                display="Reference Type"
                value={BibliographicReferenceType.courtCase}
            />

            {labelsAndValues
                .filter(({ value }) => value !== null && typeof value !== 'undefined')
                .map((valueAndDisplay) => (
                    <SinglePropertyPresenter {...valueAndDisplay} key={valueAndDisplay.display} />
                ))}
        </ResourceDetailFullViewPresenter>
    );
};
