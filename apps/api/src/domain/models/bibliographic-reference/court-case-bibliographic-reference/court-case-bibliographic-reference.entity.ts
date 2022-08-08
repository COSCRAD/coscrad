import { NestedDataType } from '@coscrad/data-types';
import { RegisterIndexScopedCommands } from '../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../../lib/errors/InternalError';
import { InvariantValidationMethod } from '../../../../lib/web-of-knowledge/decorators/invariant-validation-method.decorator';
import { DTO } from '../../../../types/DTO';
import { ResultOrError } from '../../../../types/ResultOrError';
import InvalidResourceDTOError from '../../../domainModelValidators/errors/InvalidResourceDTOError';
import { Valid } from '../../../domainModelValidators/Valid';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
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

    @NestedDataType(CourtCaseBibliographicReferenceData)
    readonly data: CourtCaseBibliographicReferenceData;

    constructor(dto: DTO<CourtCaseBibliographicReference>) {
        super({ ...dto, type: ResourceType.bibliographicReference });

        if (isNullOrUndefined(dto)) return;

        this.data = new CourtCaseBibliographicReferenceData(dto.data);
    }

    @InvariantValidationMethod(
        (allErrors: InternalError[], instance: CourtCaseBibliographicReference) =>
            new InvalidResourceDTOError(ResourceType.bibliographicReference, instance.id, allErrors)
    )
    validateInvariants(): ResultOrError<Valid> {
        // Note: there are no complex invariant rules for this model

        return Valid;
    }

    protected getExternalReferences(): AggregateCompositeIdentifier[] {
        return [];
    }

    protected getResourceSpecificAvailableCommands(): string[] {
        return [];
    }
}
