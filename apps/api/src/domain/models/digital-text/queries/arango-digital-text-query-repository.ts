import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { Maybe } from '../../../../lib/types/maybe';
import { isNotFound, NotFound } from '../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../../../persistence/database/arango-database';
import { ArangoDatabaseForCollection } from '../../../../persistence/database/arango-database-for-collection';
import mapDatabaseDocumentToAggregateDTO from '../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDocument from '../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { DigitalTextViewModel } from '../../../../queries/digital-text';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { MultilingualTextItem } from '../../../common/entities/multilingual-text';
import { AggregateId } from '../../../types/AggregateId';
import { IResourceConnectionDto } from '../../context/commands/connect-resources-with-note/resources-connected-with-note.event-handler';
import { INoteCreationDto } from '../../context/commands/create-note-about-resource/note-about-resource-created.event-handler';
import { MultilingualAudioItem } from '../../shared/multilingual-audio/multilingual-audio-item.entity';
import { MultilingualAudio } from '../../shared/multilingual-audio/multilingual-audio.entity';
import { BaseArangoResourceViewQueryBuilder } from '../../term/repositories/base-arango-resource-query-builder';
import { ContributionSummary } from '../../user-management';
import DigitalTextPage from '../entities/digital-text-page.entity';
import { IDigitalTextQueryRepository } from './digital-text-query-repository.interface';

export class ArangoDigitalTextQueryRepository implements IDigitalTextQueryRepository {
    private readonly database: ArangoDatabaseForCollection<DigitalTextViewModel>;

    private readonly baseResourceQueryBuilder: BaseArangoResourceViewQueryBuilder;

    constructor(private readonly connectionProvider: ArangoConnectionProvider) {
        this.database = new ArangoDatabaseForCollection(
            new ArangoDatabase(connectionProvider.getConnection()),
            'digitalText__VIEWS'
        );

        this.baseResourceQueryBuilder = new BaseArangoResourceViewQueryBuilder(
            'digitalText__VIEWS'
        );
    }

    create(digitalText: DigitalTextViewModel): Promise<void> {
        return this.database.create(mapEntityDTOToDatabaseDocument(digitalText));
    }

    async createMany(digitalTexts: DigitalTextViewModel[]): Promise<void> {
        const viewDocuments = digitalTexts.map(mapEntityDTOToDatabaseDocument);

        await this.database.createMany(viewDocuments);
    }

    async fetchById(id: AggregateId): Promise<Maybe<DigitalTextViewModel>> {
        const searchResult = await this.database.fetchById(id);

        if (isNotFound(searchResult)) {
            return NotFound;
        }

        return DigitalTextViewModel.fromDto(mapDatabaseDocumentToAggregateDTO(searchResult));
    }

    async fetchMany(): Promise<DigitalTextViewModel[]> {
        const result = await this.database.fetchMany();

        return result.map((doc) =>
            DigitalTextViewModel.fromDto(mapDatabaseDocumentToAggregateDTO(doc))
        );
    }

    async count(): Promise<number> {
        return this.database.getCount();
    }

    async allowUser(aggregateId: AggregateId, userId: AggregateId): Promise<void> {
        await this.database.query(this.baseResourceQueryBuilder.allowUser(aggregateId, userId));
    }

    async tag(id: string, tagId: string): Promise<void> {
        await this.database.query(this.baseResourceQueryBuilder.tag(id, tagId));
    }

    async createNoteAbout(id: string, dto: INoteCreationDto): Promise<void> {
        await this.database.query(this.baseResourceQueryBuilder.createNoteAbout(id, dto));
    }

    async createConnection(id: string, dto: IResourceConnectionDto): Promise<void> {
        await this.database.query(this.baseResourceQueryBuilder.connectResourcesWithNote(id, dto));
    }

    async publish(id: AggregateId): Promise<void> {
        await this.database.update(id, {
            isPublished: true,
        });
    }

    async attribute(id: string, contributionSummary: ContributionSummary): Promise<void> {
        await this.database.query(this.baseResourceQueryBuilder.attribute(id, contributionSummary));
    }

    async translateTitle(id: string, translation: string, languageCode: LanguageCode) {
        await this.database.query(
            this.baseResourceQueryBuilder.translateName(
                id,
                translation,
                languageCode,
                MultilingualTextItemRole.freeTranslation
            )
        );
    }

    async addPage(digitalTextId: string, pageIdentifier: string): Promise<void> {
        const query = `
        FOR doc IN @@collectionName
        FILTER doc._key == @id
        UPDATE doc WITH {
            pages: doc.pages == null ? [@newPage] : APPEND(doc.pages,@newPage)
        } IN @@collectionName
        `;

        const bindVars = {
            '@collectionName': 'digitalText__VIEWS',
            id: digitalTextId,
            newPage: new DigitalTextPage({
                identifier: pageIdentifier,
                audio: MultilingualAudio.buildEmpty(),
            }).toDTO(),
        };

        await this.database.query({ query, bindVars });
    }

    async addContentToPage(
        digitalTextId: string,
        pageIdentifier: string,
        text: string,
        languageCode: LanguageCode
    ): Promise<void> {
        const query = `
        FOR doc in @@collectionName
        FILTER doc._key == @id
        LET newPages = (
            FOR p IN doc.pages == null ? [] : doc.pages
            RETURN MERGE(
                p,
                p.identifier == @pageIdentifier ? { content: @content } : {}
            )
        )
        UPDATE doc WITH {
            pages: newPages
        } in @@collectionName
        `;

        const bindVars = {
            '@collectionName': 'digitalText__VIEWS',
            id: digitalTextId,
            pageIdentifier,
            content: buildMultilingualTextWithSingleItem(text, languageCode).toDTO(),
        };

        await this.database.query({
            query,
            bindVars,
        });
    }

    async translatePageContent(
        digitalTextId: string,
        pageIdentifier: string,
        translation: string,
        languageCode: LanguageCode
    ): Promise<void> {
        const query = `
            FOR doc IN @@collectionName
            FILTER doc._key == @id
            LET newPages = (
                FOR p IN doc.pages == null ? [] : doc.pages
                RETURN MERGE(
                    p,
                    p.identifier == @pageIdentifier ? { content: { items: APPEND(p.content.items,@translationItem)}} : {}
                )
            )
            UPDATE doc WITH {
                pages: newPages
            } in @@collectionName
        `;

        const bindVars = {
            '@collectionName': 'digitalText__VIEWS',
            id: digitalTextId,
            pageIdentifier,
            translationItem: new MultilingualTextItem({
                text: translation,
                languageCode,
                role: MultilingualTextItemRole.freeTranslation,
            }).toDTO(),
        };

        await this.database.query({
            query,
            bindVars,
        });
    }

    async addAudioToPage(
        digitalTextId: string,
        pageIdentifier: string,
        audioItemId: string,
        languageCode: LanguageCode
    ): Promise<void> {
        const query = `
            FOR doc IN @@collectionName
            FILTER doc._key == @id
            LET newPages = (
                FOR p IN doc.pages == null ? [] : doc.pages
                RETURN MERGE(
                    p,
                    p.identifier == @pageIdentifier ? { audio: { items: APPEND(p.audio.items,@newAudioItem) }} : {}
                )
            )
            UPDATE doc WITH {
                pages: newPages
            } in @@collectionName
        `;

        const bindVars = {
            '@collectionName': 'digitalText__VIEWS',
            id: digitalTextId,
            pageIdentifier,
            newAudioItem: new MultilingualAudioItem({
                audioItemId,
                languageCode,
            }).toDTO(),
        };

        await this.database.query({ query, bindVars });
    }

    async addPhotographToPage(
        digitalTextId: string,
        pageIdentifier: string,
        photographId: string
    ): Promise<void> {
        const query = `
            FOR doc IN @@collectionName
            FILTER doc._key == @id
            LET newPages = (
                FOR p IN doc.pages == null ? [] : doc.pages
                RETURN MERGE(
                    p,
                    p.identifier == @pageIdentifier ? { photographId: @photographId } : {}
                )
            )
            UPDATE doc WITH {
                pages: newPages
            } in @@collectionName
        `;

        const bindVars = {
            '@collectionName': 'digitalText__VIEWS',
            id: digitalTextId,
            pageIdentifier,
            photographId,
        };

        await this.database.query({ query, bindVars });
    }
}
