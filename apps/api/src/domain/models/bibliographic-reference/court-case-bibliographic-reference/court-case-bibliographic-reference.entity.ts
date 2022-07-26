import { RegisterIndexScopedCommands } from '../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { DTO } from '../../../../types/DTO';
import { ResultOrError } from '../../../../types/ResultOrError';
import InvalidResourceDTOError from '../../../domainModelValidators/errors/InvalidResourceDTOError';
import validateSimpleInvariants from '../../../domainModelValidators/utilities/validateSimpleInvariants';
import { Valid } from '../../../domainModelValidators/Valid';
import { AggregateType } from '../../../types/AggregateType';
import { ResourceType } from '../../../types/ResourceType';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import { Resource } from '../../resource.entity';
import { IBibliographicReference } from '../interfaces/bibliographic-reference.interface';
import { CourtCaseBibliographicReferenceData } from './court-case-bibliographic-reference-data.entity';

@RegisterIndexScopedCommands([])
export class CourtCaseBibliographicReference
    extends Resource
    implements IBibliographicReference<CourtCaseBibliographicReferenceData>
{
    readonly type = AggregateType.bibliographicReference;
    readonly data: CourtCaseBibliographicReferenceData;

    constructor(dto: DTO<CourtCaseBibliographicReference>) {
        super({ ...dto, type: ResourceType.bibliographicReference });

        if (isNullOrUndefined(dto)) return;

        this.data = new CourtCaseBibliographicReferenceData(dto.data);
    }

    validateInvariants(): ResultOrError<Valid> {
        const typeErrors = validateSimpleInvariants(CourtCaseBibliographicReference, this);

        if (typeErrors.length > 0)
            return new InvalidResourceDTOError(this.type, this.id, typeErrors);

        return Valid;
    }

    getAvailableCommands(): string[] {
        return [];
    }
}
