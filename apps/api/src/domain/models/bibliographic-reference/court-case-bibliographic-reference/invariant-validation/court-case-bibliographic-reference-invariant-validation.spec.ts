import { DTO } from '../../../../../types/DTO';
import InvalidResourceDTOError from '../../../../domainModelValidators/errors/InvalidResourceDTOError';
import { Valid } from '../../../../domainModelValidators/Valid';
import { AggregateType } from '../../../../types/AggregateType';
import assertTypeErrorsFromInvalidFuzz from '../../../__tests__/invariant-validation-helpers/assertTypeErrorsFromInvalidFuzz';
import { dummyUuid } from '../../../__tests__/utilities/dummyUuid';
import { BibliographicReferenceType } from '../../types/BibliographicReferenceType';
import { CourtCaseBibliographicReference } from '../court-case-bibliographic-reference.entity';

const validDto: DTO<CourtCaseBibliographicReference> = {
    type: AggregateType.bibliographicReference,
    id: dummyUuid,
    published: true,
    data: {
        type: BibliographicReferenceType.courtCase,
        caseName: 'Smokey Bear vs. Camper Joe',
        creators: [],
        abstract: 'Smokey did not steal those picnic baskets!',
        dateDecided: 'Recorded July 01, 1958',
        court: 'Saturday Morning Specials',
        url: 'https://www.thebearisinnocent.org',
        pages: 'i-ix, 1-55',
    },
};

describe('CourtCaseBibliographicReference.validateInvariants', () => {
    describe('when the data is valid', () => {
        it('should return Valid', () => {
            const validInstance = new CourtCaseBibliographicReference(validDto);

            const result = validInstance.validateInvariants();

            expect(result).toBe(Valid);
        });
    });

    describe('when the data is invalid', () => {
        describe('when one of the properties does not have the correct COSCRAD data type', () => {
            assertTypeErrorsFromInvalidFuzz(
                CourtCaseBibliographicReference,
                validDto,
                InvalidResourceDTOError
            );
        });
    });
});
