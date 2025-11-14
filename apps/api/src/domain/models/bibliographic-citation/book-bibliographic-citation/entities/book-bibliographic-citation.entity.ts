import { AggregateType, BibliographicCitationType, LanguageCode } from '@coscrad/api-interfaces';
import { NestedDataType } from '@coscrad/data-types';
import { isNonEmptyObject } from '@coscrad/validation-constraints';
import { RegisterIndexScopedCommands } from '../../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { InternalError, isInternalError } from '../../../../../lib/errors/InternalError';
import { Maybe } from '../../../../../lib/types/maybe';
import cloneToPlainObject from '../../../../../lib/utilities/cloneToPlainObject';
import formatAggregateCompositeIdentifier from '../../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import { DTO } from '../../../../../types/DTO';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { buildMultilingualTextWithSingleItem } from '../../../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../../common/entities/multilingual-text';
import { AggregateCompositeIdentifier } from '../../../../types/AggregateCompositeIdentifier';
import { ResourceType } from '../../../../types/ResourceType';
import { isNullOrUndefined } from '../../../../utilities/validation/is-null-or-undefined';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import BaseDomainModel from '../../../base-domain-model.entity';
import {
    CreationEventHandlerMap,
    buildAggregateRootFromEventHistory,
} from '../../../build-aggregate-root-from-event-history';
import { ResourceCompositeIdentifier } from '../../../context/commands';
import { Resource } from '../../../resource.entity';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import BibliographicCitationCreator from '../../common/bibliographic-citation-creator.entity';
import { registerDigitalRepresentationForBibliographicCitation } from '../../common/methods/register-digital-representation-for-bibliographic-citation';
import { IBibliographicCitation } from '../../interfaces/bibliographic-citation.interface';
import { BookBibliographicCitationCreated } from '../commands/create-book-bibliographic-citation/book-bibliographic-citation-created.event';
import BookBibliographicCitationData from './book-bibliographic-citation-data.entity';

@CoscradDataExample<BookBibliographicCitation>({
    example: {
        id: buildDummyUuid(1),
        type: ResourceType.bibliographicCitation,
        data: {
            type: BibliographicCitationType.book,
            title: 'This is a textbook written by a professor long agon.',
            creators: [],
        },
        published: false,
    },
})
@RegisterIndexScopedCommands(['CREATE_BOOK_BIBLIOGRAPHIC_CITATION'])
export class BookBibliographicCitation
    extends Resource
    implements IBibliographicCitation<BookBibliographicCitationData>
{
    readonly type = ResourceType.bibliographicCitation;

    @NestedDataType(ResourceCompositeIdentifier, {
        label: 'digital representation resource composite ID',
        description:
            'a reference to the resource within the web-of-knowledge that contains the contents of the referenced work',
        isOptional: true,
    })
    digitalRepresentationResourceCompositeIdentifier?: ResourceCompositeIdentifier;

    @NestedDataType(BookBibliographicCitationData, {
        label: 'reference data',
        description: 'citation information for the referenced book',
    })
    readonly data: BookBibliographicCitationData;

    constructor(dto: DTO<BookBibliographicCitation>) {
        super({ ...dto, type: ResourceType.bibliographicCitation });

        if (isNullOrUndefined(dto)) return;

        const {
            digitalRepresentationResourceCompositeIdentifier:
                digitalRepresentationResourceCompositeIdentifier,
        } = dto;

        this.data = new BookBibliographicCitationData(dto.data);

        this.digitalRepresentationResourceCompositeIdentifier = isNonEmptyObject(
            digitalRepresentationResourceCompositeIdentifier
        )
            ? cloneToPlainObject(digitalRepresentationResourceCompositeIdentifier)
            : digitalRepresentationResourceCompositeIdentifier;
    }

    registerDigitalRepresentation(compositeIdentifier: ResourceCompositeIdentifier) {
        return registerDigitalRepresentationForBibliographicCitation(this, compositeIdentifier);
    }

    getName(): MultilingualText {
        return buildMultilingualTextWithSingleItem(this.data.title, LanguageCode.English);
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

    static fromDto<T extends BaseDomainModel>(dto: DTO<T>): T {
        return new BookBibliographicCitation(dto as BookBibliographicCitation) as unknown as T;
    }

    static fromEventHistory(
        eventHistory: BaseEvent[],
        id: AggregateId
    ): Maybe<ResultOrError<BookBibliographicCitation>> {
        const creationEventHandlerMap: CreationEventHandlerMap<BookBibliographicCitation> =
            new Map().set(
                'BOOK_BIBLIOGRAPHIC_CITATION_CREATED',
                BookBibliographicCitation.buildBookBibliographicCitationFromBookBibliographicCitationCreated
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

    private static buildBookBibliographicCitationFromBookBibliographicCitationCreated({
        payload: {
            aggregateCompositeIdentifier: { id },
            title,
            creators,
            // optional properties
            abstract,
            year,
            publisher,
            place,
            url,
            numberOfPages,
            isbn,
        },
    }: BookBibliographicCitationCreated): ResultOrError<BookBibliographicCitation> {
        const instance = new BookBibliographicCitation({
            type: AggregateType.bibliographicCitation,
            id,
            data: new BookBibliographicCitationData({
                type: BibliographicCitationType.book,
                title,
                creators: creators.map((dto) => new BibliographicCitationCreator(dto)),
                // optional properties
                abstract,
                year,
                publisher,
                place,
                url,
                numberOfPages,
                isbn,
            }),
            published: false,
        });

        const invariantValidationResult = instance.validateInvariants();

        if (isInternalError(invariantValidationResult)) {
            throw new InternalError(
                `Failed to event source Book Bibliographic Citation: ${formatAggregateCompositeIdentifier(
                    {
                        type: AggregateType.bibliographicCitation,
                        id,
                    }
                )} due to invalid existing state`,
                [invariantValidationResult]
            );
        }

        return instance;
    }
}
