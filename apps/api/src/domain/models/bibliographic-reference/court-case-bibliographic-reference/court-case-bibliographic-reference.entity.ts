import { ResultOrError } from '../../../../types/ResultOrError';
import { Valid } from '../../../domainModelValidators/Valid';
import { AggregateType } from '../../../types/AggregateType';
import { Resource } from '../../resource.entity';
import { IBibliographicReference } from '../interfaces/bibliographic-reference.interface';
import { CourtCaseBibliographicReferenceData } from './court-case-bibliographic-reference-data.entity';

export class CourtCaseBibliographicReference
    extends Resource
    implements IBibliographicReference<CourtCaseBibliographicReferenceData>
{
    readonly type = AggregateType.bibliographicReference;
    readonly data: CourtCaseBibliographicReferenceData;

    validateInvariants(): ResultOrError<Valid> {
        return Valid;
    }

    getAvailableCommands(): string[] {
        return [];
    }
}
