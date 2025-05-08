import {
    ICommandFormAndLabels,
    IDetailQueryResult,
    IMultilingualTextItem,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { MultilingualTextItem } from '../../../../../domain/common/entities/multilingual-text';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { Maybe } from '../../../../../lib/types/maybe';
import { isNotFound } from '../../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../../../../persistence/database/arango-database';
import { ArangoDatabaseForCollection } from '../../../../../persistence/database/arango-database-for-collection';
import mapDatabaseDocumentToAggregateDTO from '../../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDocument from '../../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { ArangoResourceQueryBuilder } from '../../../term/repositories/arango-resource-query-builder';
import { TranscriptItem } from '../../shared/entities/transcript-item.entity';
import { TranscriptParticipant } from '../../shared/entities/transcript-participant';
import { Transcript } from '../../shared/entities/transcript.entity';
import { TranscriptLineItemDto, TranslationItem } from '../commands';
import { EventSourcedAudioItemViewModel } from '../queries';
import {
    IAudioItemQueryRepository,
    TranslationLineItemDto,
} from '../queries/audio-item-query-repository.interface';

export class ArangoAudioItemQueryRepository implements IAudioItemQueryRepository {
    private readonly database: ArangoDatabaseForCollection<
        IDetailQueryResult<EventSourcedAudioItemViewModel & { actions: ICommandFormAndLabels[] }>
    >;

    private readonly baseResourceQueryBuilder = new ArangoResourceQueryBuilder('audioItem__VIEWS');

    constructor(arangoConnectionProvider: ArangoConnectionProvider) {
        this.database = new ArangoDatabaseForCollection(
            new ArangoDatabase(arangoConnectionProvider.getConnection()),
            'audioItem__VIEWS'
        );
    }

    async create(
        view: IDetailQueryResult<EventSourcedAudioItemViewModel> & {
            _actions: ICommandFormAndLabels[];
        }
    ): Promise<void> {
        await this.database.create(mapEntityDTOToDatabaseDocument(view));
    }

    async createMany(
        views: (EventSourcedAudioItemViewModel & { actions: ICommandFormAndLabels[] } & {
            actions: ICommandFormAndLabels[];
        })[]
    ): Promise<void> {
        await this.database.createMany(views.map(mapEntityDTOToDatabaseDocument));
    }

    async delete(id: AggregateId): Promise<void> {
        return this.database.delete(id);
    }

    async publish(id: AggregateId): Promise<void> {
        await this.database.update(id, {
            isPublished: true,
        });
    }

    async fetchById(
        id: AggregateId
    ): Promise<Maybe<EventSourcedAudioItemViewModel & { actions: ICommandFormAndLabels[] }>> {
        const result = await this.database.fetchById(id);

        if (isNotFound(result)) return result;

        // should we rename this helper method?
        const dto = mapDatabaseDocumentToAggregateDTO(result) as EventSourcedAudioItemViewModel & {
            actions: ICommandFormAndLabels[];
        };

        return EventSourcedAudioItemViewModel.fromDto(dto);
    }

    async fetchMany(): Promise<
        (EventSourcedAudioItemViewModel & { actions: ICommandFormAndLabels[] })[]
    > {
        const documents = await this.database.fetchMany();

        return documents.map(
            mapDatabaseDocumentToAggregateDTO
        ) as (EventSourcedAudioItemViewModel & {
            actions: ICommandFormAndLabels[];
        })[];
    }

    async translateName(
        id: AggregateId,
        { text, languageCode, role }: IMultilingualTextItem
    ): Promise<void> {
        const query = `
        FOR doc IN @@collectionName
        FILTER doc._key == @id
        let newItem = {
                    text: @text,
                    languageCode: @languageCode,
                    role: @role
        }
        UPDATE doc WITH {
            name: {
                items: APPEND(doc.name.items,newItem)
            }
        } IN @@collectionName
         RETURN OLD
        `;

        const bindVars = {
            // TODO save this as an instance variable or global constant
            '@collectionName': 'audioItem__VIEWS',
            id: id,
            text: text,
            role: role,
            languageCode: languageCode,
        };

        const cursor = await this.database
            .query({
                query,
                bindVars,
            })
            .catch((reason) => {
                throw new InternalError(`Failed to translate term via TermRepository: ${reason}`);
            });

        await cursor.all();
    }

    // TODO Add a test case for this
    async createTranscript(id: AggregateId): Promise<void> {
        const emptyTranscript = Transcript.buildEmpty();

        const query = `
        FOR doc IN @@collectionName
        FILTER doc._key == @id
        UPDATE doc WITH {
            transcript: @transcriptDto
        } IN @@collectionName
        `;

        const bindVars = {
            '@collectionName': 'audioItem__VIEWS',
            id,
            transcriptDto: emptyTranscript.toDTO(),
        };

        const cursor = await this.database.query({ query, bindVars });

        await cursor.all();
    }

    async addParticipant(id: AggregateId, { name, initials }: TranscriptParticipant) {
        const query = `
        FOR doc IN @@collectionName
        FILTER doc._key == @id
        let newParticipant = {
            name: @name,
            initials: @initials
        }
        update doc with {
            transcript: MERGE(doc.transcript,{
                participants: APPEND(doc.transcript.participants,newParticipant)
            }) 
        } IN @@collectionName
        `;

        const bindVars = {
            '@collectionName': 'audioItem__VIEWS',
            id,
            name,
            initials,
        };

        const cursor = await this.database.query({ query, bindVars });

        await cursor.all();
    }

    async addLineItem(
        id: AggregateId,
        {
            speakerInitials,
            inPointMilliseconds,
            outPointMilliseconds,
            text,
            languageCode,
        }: TranscriptLineItemDto
    ): Promise<void> {
        const query = `
        FOR doc IN @@collectionName
        FILTER doc._key == @id

        update doc with {
            transcript: MERGE(doc.transcript,{
                items: APPEND(doc.transcript.items, @lineItem)
            })
        } IN @@collectionName
        `;

        const bindVars = {
            '@collectionName': 'audioItem__VIEWS',
            id,
            lineItem: new TranscriptItem({
                text: buildMultilingualTextWithSingleItem(text, languageCode),
                inPointMilliseconds,
                outPointMilliseconds,
                speakerInitials,
            }),
        };

        await this.database.query({ query, bindVars });
    }

    async importLineItems(id: AggregateId, lineItems: TranscriptLineItemDto[]) {
        const query = `
        FOR doc IN @@collectionName
        FILTER doc._key == @id

        update doc with {
            transcript: MERGE(doc.transcript,{
                items: APPEND(doc.transcript.items, @lineItems)
            })
        } IN @@collectionName
        `;

        const bindVars = {
            '@collectionName': 'audioItem__VIEWS',
            id,
            lineItems: lineItems.map(
                ({
                    inPointMilliseconds,
                    outPointMilliseconds,
                    text,
                    languageCode,
                    speakerInitials,
                }) =>
                    new TranscriptItem({
                        text: buildMultilingualTextWithSingleItem(text, languageCode),
                        inPointMilliseconds,
                        outPointMilliseconds,
                        speakerInitials,
                    })
            ),
        };

        await this.database.query({ query, bindVars });
    }

    async translateLineItem(
        id: AggregateId,
        // TODO Consider whether the out point is actually necessary here
        { languageCode, text, inPointMilliseconds, outPointMilliseconds }: TranslationLineItemDto
    ) {
        const newMultilingualTextItem = new MultilingualTextItem({
            languageCode,
            text,
            // TODO add this to the event payload
            role: MultilingualTextItemRole.freeTranslation,
        });

        const query = `
        FOR doc IN @@collectionName
        FILTER doc._key == @id

        let updatedItems = (
            FOR item IN doc.transcript.items
            let updatedItem = item.inPointMilliseconds == @inPointMilliseconds && item.outPointMilliseconds == @outPointMilliseconds ? MERGE(item,{ text: { items: APPEND(item.text.items,@newItem) }}) : item
            return updatedItem
        )

        update doc with {
            transcript: MERGE(doc.transcript,{
                items: updatedItems
            })
        } IN @@collectionName
        `;

        const bindVars = {
            '@collectionName': 'audioItem__VIEWS',
            id,
            inPointMilliseconds,
            outPointMilliseconds,
            newItem: newMultilingualTextItem,
        };

        await this.database.query({ query, bindVars });
    }

    async importTranslationsForTranscript(
        id: AggregateId,
        translations: TranslationItem[]
    ): Promise<void> {
        const timeStampsAndNewMultilingualTextItems = translations.map(
            ({ inPointMilliseconds, translation: text, languageCode }) => ({
                inPointMilliseconds,
                translationItem: new MultilingualTextItem({
                    text,
                    languageCode,
                    role: MultilingualTextItemRole.freeTranslation,
                }),
            })
        );

        const query = `
        for doc in @@collectionName
        filter doc._key == @id

        let updatedTranscriptItems = (
            for existingItem in doc.transcript.items
            let index = position(@translations[*].inPointMilliseconds,existingItem.inPointMilliseconds,true)
             return merge_recursive(existingItem,
                index == -1 
                    ? {}
                    : {
                        text: {
                            items: append(existingItem.text.items,@translations[index].translationItem)
                        }
                    }
            )
        )

        update doc with {
            transcript: {
                        items: updatedTranscriptItems
                        }
                    } in @@collectionName
            `;

        const bindVars = {
            '@collectionName': 'audioItem__VIEWS',
            id,
            translations: timeStampsAndNewMultilingualTextItems,
        };

        await this.database.query({ query, bindVars });
    }

    async count(): Promise<number> {
        return this.database.getCount();
    }

    async allowUser(aggregateId: AggregateId, userId: AggregateId): Promise<void> {
        await this.database.query(this.baseResourceQueryBuilder.allowUser(aggregateId, userId));
    }
}
