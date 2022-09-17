import { NestedDataType } from '@coscrad/data-types';
import { RegisterIndexScopedCommands } from '../../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { DTO } from '../../../../../types/DTO';
import { AggregateCompositeIdentifier } from '../../../../types/AggregateCompositeIdentifier';
import { AggregateType } from '../../../../types/AggregateType';
import { ResourceType } from '../../../../types/ResourceType';
import { isNullOrUndefined } from '../../../../utilities/validation/is-null-or-undefined';
import { Resource } from '../../../resource.entity';
import { IBibliographicReference } from '../../interfaces/bibliographic-reference.interface';
import { CourtCaseBibliographicReferenceData } from './court-case-bibliographic-reference-data.entity';

@RegisterIndexScopedCommands(['CREATE_COURT_CASE_BIBLIOGRAPHIC_REFERENCE'])
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

    protected validateComplexInvariants(): InternalError[] {
        return [];
    }

    protected getExternalReferences(): AggregateCompositeIdentifier[] {
        return [];
    }

    protected getResourceSpecificAvailableCommands(): string[] {
        return [];
    }
}
