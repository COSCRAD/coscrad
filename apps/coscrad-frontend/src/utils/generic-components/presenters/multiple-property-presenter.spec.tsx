import { IBookBibliographicReferenceData } from '@coscrad/api-interfaces';
import { buildDummyBibliographicReferences } from '../../../components/resources/bibliographic-references/test-utils/build-dummy-bibliographic-references';
import { MultiplePropertyPresenter, PropertyLabels } from './multiple-property-presenter';

const dummyBibliographicReferences = buildDummyBibliographicReferences();

const dummyData: IBookBibliographicReferenceData =
    dummyBibliographicReferences[1] as IBookBibliographicReferenceData;

const bibliographicReferenceKeysAndLabels: PropertyLabels<IBookBibliographicReferenceData> = {
    abstract: 'Abstract',
    publicationTitle: 'Publication Title',
    issueDate: 'Issue Date',
    issn: 'ISSN',
    doi: 'DOI',
};

describe('MultiplePropertyPresenter', () => {
    describe('when a bibliographic reference is passed in', () => {
        it('should display each of the properties present on the keysAndLabels object', () => {
            const { queryByLabelText, getByLabelText } = render(
                <MultiplePropertyPresenter
                    keysAndLabels={bibliographicReferenceKeysAndLabels}
                    data={dummyData}
                />
            );
        });
    });
});
