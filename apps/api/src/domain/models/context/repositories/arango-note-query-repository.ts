import {
    IMultilingualTextItem,
    LanguageCode,
    PaginatedResponse,
    ResourceCompositeIdentifier,
} from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { FetchManyQueryOptions } from '../../../../app/domain-modules/web-of-knowledge/interfaces/resource-query-repository.interface';
import { InternalError } from '../../../../lib/errors/InternalError';
import { Maybe } from '../../../../lib/types/maybe';
import { isNotFound, NotFound } from '../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../../../persistence/database/arango-database';
import { ArangoDatabaseForCollection } from '../../../../persistence/database/arango-database-for-collection';
import convertResourceCompositeIdentifierToArangoDocumentHandle from '../../../../persistence/database/utilities/convertResourceCompositeIdentifierToArangoDocumentHandle';
import { DTO } from '../../../../types/DTO';
import { AggregateId } from '../../../types/AggregateId';
import { MultilingualAudioItem } from '../../shared/multilingual-audio/multilingual-audio-item.entity';
import { BaseArangoResourceViewQueryBuilder } from '../../term/repositories/base-arango-resource-query-builder';
import { EventSourcedNoteViewModel } from '../event-sourced-note.view-model';
import { INoteQueryRepository } from './note-query-repository.interface';

const mapNoteViewDtoToArangoDocument = (dto: DTO<EventSourcedNoteViewModel>) => {
    const { to: toMember, from: fromMember, self: selfMember } = dto.connectedResources;

    const toAndFromCompositeIds: [ResourceCompositeIdentifier, ResourceCompositeIdentifier] =
        isNullOrUndefined(selfMember)
            ? [
                  { type: toMember.type, id: toMember.id },
                  { type: fromMember.type, id: fromMember.id },
              ]
            : [
                  {
                      type: selfMember.type,
                      id: selfMember.id,
                  },
                  {
                      type: selfMember.type,
                      id: selfMember.id,
                  },
              ];

    const [_to, _from] = toAndFromCompositeIds.map(
        convertResourceCompositeIdentifierToArangoDocumentHandle
    );

    // TODO Use `toDto`
    const document = {
        ...dto,
        _to,
        _from,
        _key: dto.id,
    };

    return document;
};

const mapArangoDocumentToNoteDto = (document) => {
    const dto = {
        ...document,
        id: document._key,
    };

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

    async fetchById(id: AggregateId): Promise<Maybe<EventSourcedNoteViewModel>> {
        const document = await this.database.fetchById(id);

        if (isNotFound(document)) {
            return NotFound;
        }

        const dto = mapArangoDocumentToNoteDto(document);

        return EventSourcedNoteViewModel.fromDto(dto);
    }

    async fetchMany(
        options?: FetchManyQueryOptions
    ): Promise<PaginatedResponse<EventSourcedNoteViewModel>> {
        if (options) {
            throw new InternalError(`user query options are not available for notes`);
        }

        const documents = await this.database.fetchMany();

        // @ts-expect-error TODO fix this
        return documents.map((document) =>
            EventSourcedNoteViewModel.fromDto(mapArangoDocumentToNoteDto(document))
        );
    }

    async create(note: EventSourcedNoteViewModel): Promise<void> {
        const document = mapNoteViewDtoToArangoDocument(note);

        await this.database.create(document);
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
                note: {
                    items: APPEND(doc.note.items,newItem)
                }
            } IN @@collectionName
            `;

        const bindVars = {
            '@collectionName': this.collectionName,
            id: id,
            text: text,
            // TODO we may want this to be passed in, presumably from an event payload
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
                      items: APPEND(doc.audio.items, @newMultilingualAudioItem)
                  }
              } IN @@collectionName
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

        await this.database.query({ query, bindVars });
    }

    createNoteAbout(
        _noteViewModel: EventSourcedNoteViewModel,
        _resourceCompositeIdentifier: ResourceCompositeIdentifier
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
