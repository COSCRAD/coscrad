import { AggregateType } from '@coscrad/api-interfaces';
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
import { BibliographicCitationUnionMember } from '../../shared';
import { BibliographicCitationType } from '../../types/bibliographic-citation-type';
import { JournalArticleBibliographicCitationCreated } from '../commands/journal-article-bibliographic-citation-created.event';
import JournalArticleBibliographicCitationData from './journal-article-bibliographic-citation-data.entity';

@BibliographicCitationUnionMember(BibliographicCitationType.journalArticle)
@RegisterIndexScopedCommands(['CREATE_JOURNAL_ARTICLE_BIBLIOGRAPHIC_CITATION'])
export class JournalArticleBibliographicCitation
    extends Resource
    implements IBibliographicCitation<JournalArticleBibliographicCitationData>
{
    readonly type = ResourceType.bibliographicCitation;

    digitalRepresentationResourceCompositeIdentifier?: ResourceCompositeIdentifier;

    @NestedDataType(JournalArticleBibliographicCitationData, {
        label: 'reference data',
        description: 'citation information for the referenced journal article',
    })
    readonly data: JournalArticleBibliographicCitationData;

    constructor(dto: DTO<JournalArticleBibliographicCitation>) {
        super({ ...dto, type: ResourceType.bibliographicCitation });

        if (isNullOrUndefined(dto)) return;

        const { digitalRepresentationResourceCompositeIdentifier } = dto;

        this.digitalRepresentationResourceCompositeIdentifier = isNonEmptyObject(
            digitalRepresentationResourceCompositeIdentifier
        )
            ? cloneToPlainObject(digitalRepresentationResourceCompositeIdentifier)
            : digitalRepresentationResourceCompositeIdentifier;

        this.data = new JournalArticleBibliographicCitationData(dto.data);
    }

    getName(): MultilingualText {
        return buildMultilingualTextWithSingleItem(this.data.title);
    }

    registerDigitalRepresentation(compositeIdentifier: ResourceCompositeIdentifier) {
        return registerDigitalRepresentationForBibliographicCitation(this, compositeIdentifier);
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
    ): Maybe<ResultOrError<JournalArticleBibliographicCitation>> {
        const creationEventHandlerMap: CreationEventHandlerMap<JournalArticleBibliographicCitation> =
            new Map().set(
                'JOURNAL_ARTICLE_BIBLIOGRAPHIC_CITATION_CREATED',
                JournalArticleBibliographicCitation.buildJournalArticleBibliographicCitationFromCreationEvent
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

    private static buildJournalArticleBibliographicCitationFromCreationEvent({
        payload: {
            aggregateCompositeIdentifier: { id },
            title,
            creators,
            issueDate,
            abstract,
            issn,
            publicationTitle,
            url,
            doi,
        },
    }: JournalArticleBibliographicCitationCreated): ResultOrError<JournalArticleBibliographicCitation> {
        const instance = new JournalArticleBibliographicCitation({
            type: AggregateType.bibliographicCitation,
            id,
            published: false,
            hasBeenDeleted: false,
            data: {
                type: BibliographicCitationType.journalArticle,
                title,
                creators,
                issueDate,
                abstract,
                issn,
                publicationTitle,
                url,
                doi,
            },
        });

        const invariantValidationResult = instance.validateInvariants();

        if (isInternalError(invariantValidationResult)) {
            throw new InternalError(
                `failed to event source Journal Article Bibliographic Citation`,
                [invariantValidationResult]
            );
        }

        return instance;
    }
}
