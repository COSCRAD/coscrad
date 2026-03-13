import { Inject } from '@nestjs/common';
import { COSCRAD_LOGGER_TOKEN, ICoscradLogger } from '../../../../coscrad-cli/logging';
import { Maybe } from '../../../../lib/types/maybe';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../../../persistence/database/arango-database';
import { ArangoDatabaseForCollection } from '../../../../persistence/database/arango-database-for-collection';
import { SpatialFeatureViewModel } from '../../../../queries/buildViewModelForResource/viewModels/spatial-data/spatial-feature.view-model';
import { AggregateId } from '../../../types/AggregateId';
import { IResourceConnectionDto } from '../../context/commands/connect-resources-with-note/resources-connected-with-note.event-handler';
import { INoteCreationDto } from '../../context/commands/create-note-about-resource/note-about-resource-created.event-handler';
import { BaseArangoResourceViewQueryBuilder } from '../../term/repositories/base-arango-resource-query-builder';
import { ContributionSummary } from '../../user-management';
import { CoscradUserWithGroups } from '../../user-management/user/entities/user/coscrad-user-with-groups';
import { ISpatialFeatureQueryRepository } from '../queries/spatial-feature-query-repository.interface';

export class ArangoSpatialFeatureQueryRepository implements ISpatialFeatureQueryRepository {
    private readonly database: ArangoDatabaseForCollection<SpatialFeatureViewModel>;

    private readonly baseResourceQueryRepository: BaseArangoResourceViewQueryBuilder;

    constructor(
        arangoConnectionProvider: ArangoConnectionProvider,
        @Inject(COSCRAD_LOGGER_TOKEN)
        private readonly logger: ICoscradLogger
    ) {
        this.database = new ArangoDatabaseForCollection(
            new ArangoDatabase(arangoConnectionProvider.getConnection()),
            'spatial_feature__VIEWS'
        );
    }

    create(_view: SpatialFeatureViewModel): Promise<void> {
        throw new Error('Method not implemented.');
    }

    fetchById(_id: string, _user?: CoscradUserWithGroups): Promise<Maybe<SpatialFeatureViewModel>> {
        throw new Error('Method not implemented.');
    }

    createNoteAbout(_id: string, _dto: INoteCreationDto): Promise<void> {
        throw new Error('Method not implemented.');
    }

    createConnection(_id: string, _dto: IResourceConnectionDto): Promise<void> {
        throw new Error('Method not implemented.');
    }

    tag(_id: string, _tagId: string): Promise<void> {
        throw new Error('Method not implemented.');
    }

    attribute(_id: string, _contributionSummary: ContributionSummary): Promise<void> {
        throw new Error('Method not implemented.');
    }

    allowUser(_aggregateId: AggregateId, _userId: AggregateId): Promise<void> {
        throw new Error('Method not implemented.');
    }

    publish(_id: AggregateId): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
