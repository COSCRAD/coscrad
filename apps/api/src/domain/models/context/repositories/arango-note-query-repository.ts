import {
    CategorizableType,
    EdgeConnectionType,
    IEdgeConnectionContext,
    IMultilingualTextItem,
    LanguageCode,
    PaginatedResponse,
    ResourceCompositeIdentifier,
} from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { FetchManyQueryOptions } from '../../../../app/domain-modules/web-of-knowledge/interfaces/resource-query-repository.interface';
import { InternalError } from '../../../../lib/errors/InternalError';
import { Maybe } from '../../../../lib/types/maybe';
import { NotFound } from '../../../../lib/types/not-found';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../../../persistence/database/arango-database';
import { ArangoDatabaseForCollection } from '../../../../persistence/database/arango-database-for-collection';
import convertResourceCompositeIdentifierToArangoDocumentHandle from '../../../../persistence/database/utilities/convertResourceCompositeIdentifierToArangoDocumentHandle';
import mapDatabaseDocumentToAggregateDTO from '../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import { DTO } from '../../../../types/DTO';
import { AggregateId } from '../../../types/AggregateId';
import { MultilingualAudioItem } from '../../shared/multilingual-audio/multilingual-audio-item.entity';
import { MultilingualAudio } from '../../shared/multilingual-audio/multilingual-audio.entity';
import { BaseArangoResourceViewQueryBuilder } from '../../term/repositories/base-arango-resource-query-builder';
import { EventSourcedNoteViewModel } from '../note.view-model.event-sourced';
import { INoteCreationRecord, INoteQueryRepository } from './note-query-repository.interface';

type ArangoNoteDocument = Omit<EventSourcedNoteViewModel, 'id'> & {
    _key: string;
    _id: string;
    _to: string;
    _from: string;
};

const mapNoteViewDtoToArangoDocument = (
    dtoIn: DTO<EventSourcedNoteViewModel>
): ArangoNoteDocument => {
    const dto = cloneToPlainObject(dtoIn);

    const { to: toMember, from: fromMember, self: selfMember } = dto.connectedResources;

    const toAndFromCompositeIds: [ResourceCompositeIdentifier, ResourceCompositeIdentifier] =
        isNullOrUndefined(selfMember)
            ? [
                  { type: toMember.resource.type, id: toMember.resource.id },
                  { type: fromMember.resource.type, id: fromMember.resource.id },
              ]
            : [
                  {
                      type: selfMember.resource.type,
                      id: selfMember.resource.id,
                  },
                  {
                      type: selfMember.resource.type,
                      id: selfMember.resource.id,
                  },
              ];

    const [_to, _from] = toAndFromCompositeIds.map((compId) =>
        convertResourceCompositeIdentifierToArangoDocumentHandle(
            compId,
            (resourceType) => `${resourceType}__VIEWS`
        )
    );

    Object.assign(dto, {
        _to,
        _from,
        _key: dto.id,
    });

    delete dto.id;

    return dto as unknown as ArangoNoteDocument;
};

const mapArangoDocumentToNoteDto = (document) => {
    const dto = cloneToPlainObject(document);

    dto.connectedResources = {};
    /**
     * Note that it's a system error for the resource to be null here. But this
     * does happen frequently in test setup.
     */
    if ('self' in document.connectedResources && document.connectedResources.self.resource) {
        const self = mapDatabaseDocumentToAggregateDTO(document.connectedResources.self.resource);

        dto.connectedResources.self = {
            resource: self,
            context: document.connectedResources.self.context,
        };
    }

    if ('from' in document.connectedResources && document.connectedResources.from.resource) {
        dto.connectedResources.from = {
            resource: mapDatabaseDocumentToAggregateDTO(document.connectedResources.from.resource),
            context: document.connectedResources.from.context,
        };
    }

    if ('to' in document.connectedResources && document.connectedResources.to.resource) {
        dto.connectedResources.to = {
            resource: mapDatabaseDocumentToAggregateDTO(document.connectedResources.to.resource),
            context: document.connectedResources.to.context,
        };
    }

    delete dto._from;

    delete dto._to;

    delete dto._key;

    delete dto._id;

    return dto;
};

export class ArangoNoteQueryRepository implements INoteQueryRepository {
    private readonly collectionName = 'note__VIEWS';

    private readonly database: ArangoDatabaseForCollection<DTO<EventSourcedNoteViewModel>>;

    private readonly baseResourceQueryBuilder: BaseArangoResourceViewQueryBuilder;

    constructor(private readonly connectionProvider: ArangoConnectionProvider) {
        this.database = new ArangoDatabaseForCollection(
            new ArangoDatabase(connectionProvider.getConnection()),
            this.collectionName
        );

        this.baseResourceQueryBuilder = new BaseArangoResourceViewQueryBuilder(this.collectionName);
    }

    async fetchById(noteId: AggregateId): Promise<Maybe<EventSourcedNoteViewModel>> {
        const aql = `
        for doc in note__VIEWS
        filter doc._key == @noteId
        let connectedResources = doc._to == doc._from ? {
            self: {
                resource: document(doc._from),
                context: doc.connectedResources.self.context
            }
        } : {
            from: {
                resource: document(doc._from),
                context: doc.connectedResources.from.context
            },
            to: {
                resource: document(doc._to),
                context: doc.connectedResources.to.context
            }  
        }
        return MERGE(doc,{
            connectedResources
        })
        `;

        const cursor = await this.database
            .query({
                query: aql,
                bindVars: {
                    noteId,
                },
            })
            .catch((e) => {
                throw e;
            });

        const results = await cursor.all();

        if (results.length === 0) {
            return NotFound;
        }

        // TODO handle the case when the corresponding resource document is missing (system error)

        const dto = mapArangoDocumentToNoteDto(results[0]);

        return EventSourcedNoteViewModel.fromDto(dto);
    }

    async fetchMany(
        options?: FetchManyQueryOptions
    ): Promise<PaginatedResponse<EventSourcedNoteViewModel>> {
        if (options) {
            throw new InternalError(`user query options are not available for notes`);
        }

        const aql = `
            for doc in note__VIEWS
            let connectedResources = doc._from ==  doc._to ? {
                self: {
                    resource: document(doc._from),
                    context: doc.connectedResources.from.context
                }
            } : {
                to: {
                    resource: document(doc._to),
                    context: doc.connectedResources.to.context
                },
                from: {
                    resource: document(doc._from),
                    context: doc.connectedResources.from.context
                }
            }
            return MERGE(doc,{
                connectedResources
            })
        `;

        const cursor = await this.database.query({
            query: aql,
            bindVars: {},
        });

        const documents = await cursor.all();

        const dtos = documents.map(mapArangoDocumentToNoteDto);

        // TODO[https://coscrad.atlassian.net/browse/CWEBJIRA-363] Support pagination.
        return {
            page: 1,
            count: 1,
            entities: dtos.map((dto) => EventSourcedNoteViewModel.fromDto(dto)),
        };
    }

    async createMany(notes: EventSourcedNoteViewModel[]): Promise<void> {
        const documents = notes.map(mapNoteViewDtoToArangoDocument);

        await this.database.createMany(documents);
    }

    async count(options?: FetchManyQueryOptions): Promise<number> {
        if (options) {
            throw new InternalError(`user query options are not available for note count`);
        }

        return this.database.getCount();
    }

    async translate(id: string, translationItem: IMultilingualTextItem): Promise<void> {
        const { text, role, languageCode } = translationItem;

        const query = `
            FOR doc IN @@collectionName
            FILTER doc._key == @id
            let newItem = {
                        text: @text,
                        languageCode: @languageCode,
                        role: @role
            }
            UPDATE doc WITH {
                text: {
                    items: doc.note.items ? APPEND(doc.note.items,newItem) : [newItem]
                }
            } IN @@collectionName
            `;

        const bindVars = {
            '@collectionName': this.collectionName,
            id: id,
            text: text,
            // TODO [https://coscrad.atlassian.net/browse/CWEBJIRA-365] we may want this to be passed in, presumably from an event payload
            role,
            languageCode: languageCode,
        };

        const cursor = await this.database.query({ query, bindVars });

        await cursor.all();
    }

    async addAudio(
        noteId: AggregateId,
        audioItemId: AggregateId,
        languageCode: LanguageCode
    ): Promise<void> {
        const query = `
              FOR doc IN @@collectionName
              FILTER doc._key == @id
              FOR a IN audioItem__VIEWS
              FILTER a._key == @audioItemId
              UPDATE doc WITH {
                  audio: {
                      items: doc.audio.items ? APPEND(doc.audio.items, @newMultilingualAudioItem) : [@newMultilingualAudioItem]
                  }
              } IN @@collectionName
            return NEW
              `;

        const bindVars = {
            '@collectionName': this.collectionName,
            id: noteId,
            audioItemId,
            newMultilingualAudioItem: new MultilingualAudioItem({
                audioItemId,
                languageCode,
            }).toDTO(),
        };

        await this.database.query({ query, bindVars }).catch((e) => {
            throw e;
        });
    }

    async createNoteAbout(
        noteInfo: INoteCreationRecord,
        resourceCompositeIdentifier: ResourceCompositeIdentifier,
        context: IEdgeConnectionContext
    ): Promise<void> {
        const { id, text } = noteInfo;

        const view = new EventSourcedNoteViewModel({
            type: CategorizableType.note,
            id,
            connectionType: EdgeConnectionType.self,
            text,
            connectedResources: {
                self: {
                    resource: resourceCompositeIdentifier,
                    context,
                },
            },
            tags: [],
            audio: MultilingualAudio.buildEmpty(),
        });

        const document = mapNoteViewDtoToArangoDocument(view.toDto());

        await this.database.create(document);
    }

    async tag(id: string, tagId: string): Promise<void> {
        const cursor = await this.database.query(this.baseResourceQueryBuilder.tag(id, tagId));

        await cursor.all();
    }

    async connectResourcesWithNote(
        noteInfo: INoteCreationRecord,
        fromMemberCompositeIdentifier: ResourceCompositeIdentifier,
        fromMemberContext: IEdgeConnectionContext,
        toMemberCompositeIdentifier: ResourceCompositeIdentifier,
        toMemberContext: IEdgeConnectionContext
    ): Promise<void> {
        const { id, text } = noteInfo;

        const view = new EventSourcedNoteViewModel({
            type: CategorizableType.note,
            id,
            connectionType: EdgeConnectionType.self,
            text,
            connectedResources: {
                from: {
                    resource: fromMemberCompositeIdentifier,
                    context: fromMemberContext,
                },
                to: {
                    resource: toMemberCompositeIdentifier,
                    context: toMemberContext,
                },
            },
            tags: [],
            audio: MultilingualAudio.buildEmpty(),
        });

        const document = mapNoteViewDtoToArangoDocument(view.toDto());

        await this.database.create(document);
    }
}
