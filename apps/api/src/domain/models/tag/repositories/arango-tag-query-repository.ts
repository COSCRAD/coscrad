import { Maybe } from '../../../../lib/types/maybe';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../../../persistence/database/arango-database';
import { ArangoDatabaseForCollection } from '../../../../persistence/database/arango-database-for-collection';
import { TagViewModel } from '../../../../queries/buildViewModelForResource/viewModels';
import { AggregateId } from '../../../types/AggregateId';
import { IResourceConnectionDto } from '../../context/commands/connect-resources-with-note/resources-connected-with-note.event-handler';
import { INoteCreationDto } from '../../context/commands/create-note-about-resource/note-about-resource-created.event-handler';
import { BaseArangoResourceViewQueryBuilder } from '../../term/repositories/base-arango-resource-query-builder';
import { ContributionSummary } from '../../user-management';
import { ITagQueryRepository } from './tag-query-repository.interface';

export class ArangoTagQueryRepository implements ITagQueryRepository {
    private readonly database: ArangoDatabaseForCollection<TagViewModel>;

    private readonly baseResouceQueryBuilder: BaseArangoResourceViewQueryBuilder;

    constructor(private readonly connectionProvider: ArangoConnectionProvider) {
        this.database = new ArangoDatabaseForCollection(
            new ArangoDatabase(connectionProvider.getConnection()),
            'tag__VIEWS'
        );

        this.baseResouceQueryBuilder = new BaseArangoResourceViewQueryBuilder('tag__VIEWS');
    }

    create(_view: TagViewModel): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async createMany(_views: TagViewModel[]): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async fetchById(_id: string): Promise<Maybe<TagViewModel>> {
        throw new Error('Method not implemented.');
    }

    async fetchMany(): Promise<TagViewModel[]> {
        throw new Error('Method not implemented.');
    }

    async count(): Promise<number> {
        throw new Error('Method not implemented.');
    }

    async publish(_id: AggregateId): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async createNoteAbout(_id: string, _dto: INoteCreationDto): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async createConnection(_id: string, _dto: IResourceConnectionDto): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async tag(_id: string, _tagId: string): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async attribute(_id: string, _contributionSummary: ContributionSummary): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async allowUser(_aggregateId: AggregateId, _userId: AggregateId): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async CreateTag(_label: string): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
