import { DTO } from '../../../../../types/DTO';
import InvariantValidationError from '../../../../domainModelValidators/errors/InvariantValidationError';
import { Valid } from '../../../../domainModelValidators/Valid';
import { AggregateType } from '../../../../types/AggregateType';
import assertTypeErrorsFromInvalidFuzz from '../../../__tests__/invariant-validation-helpers/assertTypeErrorsFromInvalidFuzz';
import { dummyUuid } from '../../../__tests__/utilities/dummyUuid';
import { BibliographicCitationType } from '../../types/bibliographic-citation-type';
import { CourtCaseBibliographicCitation } from '../entities/court-case-bibliographic-citation.entity';

const validDto: DTO<CourtCaseBibliographicCitation> = {
    type: AggregateType.bibliographicCitation,
    id: dummyUuid,
    published: true,
    data: {
        type: BibliographicCitationType.courtCase,
        caseName: 'Smokey Bear vs. Camper Joe',
        abstract: 'Smokey did not steal those picnic baskets!',
        dateDecided: 'Recorded July 01, 1958',
        court: 'Saturday Morning Specials',
        url: 'https://www.thebearisinnocent.org',
        pages: 'i-ix, 1-55',
    },
};

describe('CourtCaseBibliographicCitation.validateInvariants', () => {
    describe('when the data is valid', () => {
        it('should return Valid', () => {
            const validInstance = new CourtCaseBibliographicCitation(validDto);

            const result = validInstance.validateInvariants();

            expect(result).toBe(Valid);
        });
    });

    describe('when the data is invalid', () => {
        describe('when one of the properties does not have the correct COSCRAD data type', () => {
            assertTypeErrorsFromInvalidFuzz(
                CourtCaseBibliographicCitation,
                validDto,
                InvariantValidationError
            );
        });
    });
});
