import { NestedDataType } from '@coscrad/data-types';
import { isNonEmptyObject } from '@coscrad/validation-constraints';
import { RegisterIndexScopedCommands } from '../../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../../../lib/errors/InternalError';
import cloneToPlainObject from '../../../../../lib/utilities/cloneToPlainObject';
import { DTO } from '../../../../../types/DTO';
import { buildMultilingualTextWithSingleItem } from '../../../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../../common/entities/multilingual-text';
import { AggregateCompositeIdentifier } from '../../../../types/AggregateCompositeIdentifier';
import { AggregateType } from '../../../../types/AggregateType';
import { ResourceType } from '../../../../types/ResourceType';
import { isNullOrUndefined } from '../../../../utilities/validation/is-null-or-undefined';
import { ResourceCompositeIdentifier } from '../../../context/commands';
import { Resource } from '../../../resource.entity';
import { registerDigitalRepresentationForBibliographicReference } from '../../common/methods/register-digital-representation-for-bibliographic-reference';
import { IBibliographicReference } from '../../interfaces/bibliographic-reference.interface';
import { CourtCaseBibliographicReferenceData } from './court-case-bibliographic-reference-data.entity';

@RegisterIndexScopedCommands(['CREATE_COURT_CASE_BIBLIOGRAPHIC_REFERENCE'])
export class CourtCaseBibliographicReference
    extends Resource
    implements IBibliographicReference<CourtCaseBibliographicReferenceData>
{
    readonly type = AggregateType.bibliographicReference;

    digitalRepresentationResourceCompositeIdentifier?: ResourceCompositeIdentifier;

    @NestedDataType(CourtCaseBibliographicReferenceData, {
        label: 'reference data',
        description: 'citation information for the referenced court case',
    })
    readonly data: CourtCaseBibliographicReferenceData;

    constructor(dto: DTO<CourtCaseBibliographicReference>) {
        super({ ...dto, type: ResourceType.bibliographicReference });

        if (isNullOrUndefined(dto)) return;

        const { digitalRepresentationResourceCompositeIdentifier } = dto;

        this.digitalRepresentationResourceCompositeIdentifier = isNonEmptyObject(
            digitalRepresentationResourceCompositeIdentifier
        )
            ? cloneToPlainObject(digitalRepresentationResourceCompositeIdentifier)
            : digitalRepresentationResourceCompositeIdentifier;

        this.data = new CourtCaseBibliographicReferenceData(dto.data);
    }

    registerDigitalRepresentation(compositeIdentifier: ResourceCompositeIdentifier) {
        return registerDigitalRepresentationForBibliographicReference(this, compositeIdentifier);
    }

    getName(): MultilingualText {
        return buildMultilingualTextWithSingleItem(this.data.caseName);
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
