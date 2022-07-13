import buildInstanceFactory from '../../domain/factories/utilities/buildInstanceFactory';
import { validAggregateOrThrow } from '../../domain/models/shared/functional';
import { CoscradUser } from '../../domain/models/user-management/user/entities/user/coscrad-user.entity';
import { IUserRepository } from '../../domain/repositories/interfaces/user-repository.interface';
import { Maybe } from '../../lib/types/maybe';
import { NotFound } from '../../lib/types/not-found';
import { ArangoCollectionId } from '../database/collection-references/ArangoCollectionId';
import { DatabaseProvider } from '../database/database.provider';
import mapDatabaseDocumentToAggregateDTO from '../database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDTO from '../database/utilities/mapEntityDTOToDatabaseDTO';
import { ArangoRepositoryForAggregate } from './arango-repository-for-aggregate';

export class ArangoCoscradUserRepository
    extends ArangoRepositoryForAggregate<CoscradUser>
    implements IUserRepository
{
    constructor(arangoDatabaseProvider: DatabaseProvider) {
        super(
            arangoDatabaseProvider,
            ArangoCollectionId.users,
            buildInstanceFactory(CoscradUser),
            mapDatabaseDocumentToAggregateDTO,
            mapEntityDTOToDatabaseDTO
        );
    }

    async fetchByProviderId(id: string): Promise<Maybe<CoscradUser>> {
        const allUserSearchResult = await this.fetchMany();

        const allUsers = allUserSearchResult.filter(validAggregateOrThrow);

        const searchResult = allUsers.find(({ authProviderUserId }) => authProviderUserId === id);

        if (!searchResult) return NotFound;

        return searchResult;
    }
}
