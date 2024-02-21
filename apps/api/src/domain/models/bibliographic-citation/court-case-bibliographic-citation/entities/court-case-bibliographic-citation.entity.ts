import { NestedDataType } from '@coscrad/data-types';
import { isNonEmptyObject } from '@coscrad/validation-constraints';
import { RegisterIndexScopedCommands } from '../../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { InternalError, isInternalError } from '../../../../../lib/errors/InternalError';
import { Maybe } from '../../../../../lib/types/maybe';
import cloneToPlainObject from '../../../../../lib/utilities/cloneToPlainObject';
import { DTO } from '../../../../../types/DTO';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { buildMultilingualTextWithSingleItem } from '../../../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../../common/entities/multilingual-text';
import { AggregateCompositeIdentifier } from '../../../../types/AggregateCompositeIdentifier';
import { AggregateType } from '../../../../types/AggregateType';
import { ResourceType } from '../../../../types/ResourceType';
import { isNullOrUndefined } from '../../../../utilities/validation/is-null-or-undefined';
import {
    CreationEventHandlerMap,
    buildAggregateRootFromEventHistory,
} from '../../../build-aggregate-root-from-event-history';
import { ResourceCompositeIdentifier } from '../../../context/commands';
import { Resource } from '../../../resource.entity';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { registerDigitalRepresentationForBibliographicCitation } from '../../common/methods/register-digital-representation-for-bibliographic-citation';
import { IBibliographicCitation } from '../../interfaces/bibliographic-citation.interface';
import { BibliographicCitationType } from '../../types/bibliographic-citation-type';
import { CourtCaseBibliographicCitationCreated } from '../commands/create-court-case-bibliographic-citation';
import { CourtCaseBibliographicCitationData } from './court-case-bibliographic-citation-data.entity';

@RegisterIndexScopedCommands(['CREATE_COURT_CASE_BIBLIOGRAPHIC_CITATION'])
export class CourtCaseBibliographicCitation
    extends Resource
    implements IBibliographicCitation<CourtCaseBibliographicCitationData>
{
    readonly type = AggregateType.bibliographicCitation;

    digitalRepresentationResourceCompositeIdentifier?: ResourceCompositeIdentifier;

    @NestedDataType(CourtCaseBibliographicCitationData, {
        label: 'reference data',
        description: 'citation information for the referenced court case',
    })
    readonly data: CourtCaseBibliographicCitationData;

    constructor(dto: DTO<CourtCaseBibliographicCitation>) {
        super({ ...dto, type: ResourceType.bibliographicCitation });

        if (isNullOrUndefined(dto)) return;

        const { digitalRepresentationResourceCompositeIdentifier } = dto;

        this.digitalRepresentationResourceCompositeIdentifier = isNonEmptyObject(
            digitalRepresentationResourceCompositeIdentifier
        )
            ? cloneToPlainObject(digitalRepresentationResourceCompositeIdentifier)
            : digitalRepresentationResourceCompositeIdentifier;

        this.data = new CourtCaseBibliographicCitationData(dto.data);
    }

    registerDigitalRepresentation(compositeIdentifier: ResourceCompositeIdentifier) {
        return registerDigitalRepresentationForBibliographicCitation(this, compositeIdentifier);
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

    static fromEventHistory(
        eventHistory: BaseEvent[],
        id: AggregateId
    ): Maybe<ResultOrError<CourtCaseBibliographicCitation>> {
        const creationEventHandlerMap: CreationEventHandlerMap<CourtCaseBibliographicCitation> =
            new Map().set(
                'COURT_CASE_BIBLIOGRAPHIC_CITATION_CREATED',
                CourtCaseBibliographicCitation.buildCourtCaseBibliographicCitationFromCreationEvent
            );

        return buildAggregateRootFromEventHistory(
            creationEventHandlerMap,
            {
                type: AggregateType.bibliographicCitation,
                id,
            },
            eventHistory
        );
    }

    private static buildCourtCaseBibliographicCitationFromCreationEvent({
        payload: {
            aggregateCompositeIdentifier: { id },
            caseName,
            abstract,
            dateDecided,
            court,
            url,
            pages,
        },
    }: CourtCaseBibliographicCitationCreated): ResultOrError<CourtCaseBibliographicCitation> {
        const instance = new CourtCaseBibliographicCitation({
            type: AggregateType.bibliographicCitation,
            id,
            published: false,
            data: {
                type: BibliographicCitationType.courtCase,
                caseName,
                abstract,
                dateDecided,
                court,
                url,
                pages,
            },
        });

        const invariantValidationResult = instance.validateInvariants();

        if (isInternalError(invariantValidationResult)) {
            throw new InternalError(`Failed to event source court case`, [
                invariantValidationResult,
            ]);
        }

        return instance;
    }
}
