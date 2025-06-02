import buildInstanceFactory from '../../../../../domain/factories/utilities/buildInstanceFactory';
import { InternalError, isInternalError } from '../../../../../lib/errors/InternalError';
import { ArangoCollectionId } from '../../../../../persistence/database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import mapDatabaseDocumentToAggregateDTO from '../../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDocument from '../../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { ArangoRepositoryForAggregate } from '../../../../../persistence/repositories/arango-repository-for-aggregate';
import { CoscradContributor } from '../entities';
import { ICoscradContributorRepository } from '../interfaces';

export class ArangoContributorRepository
    extends ArangoRepositoryForAggregate<CoscradContributor>
    implements ICoscradContributorRepository
{
    constructor(databaseProvider: ArangoDatabaseProvider) {
        super(
            databaseProvider,
            ArangoCollectionId.contributors,
            buildInstanceFactory(CoscradContributor),
            mapDatabaseDocumentToAggregateDTO,
            mapEntityDTOToDatabaseDocument
        );
    }

    async fetchMultipleById(ids: string[]): Promise<CoscradContributor[]> {
        const query = `
            for c in contributors
            filter contains_array(@ids,c._key)
            return c
        `;

        const bindVars = {
            ids,
        };

        const cursor = await this.arangoDatabaseForEntitysCollection.query({
            query,
            bindVars,
        });

        const documents = await cursor.all();

        const instances = documents
            .map((document) => this.instanceFactory(this.mapDocumentToEntityDTO(document)))
            /**
             * This would indicate invalid existing data in the database, which
             * is a system error. We want to know about this state immediately.
             */
            .filter((i): i is CoscradContributor => {
                if (isInternalError(i)) {
                    throw new InternalError('whoops');
                }

                return true;
            });

        return instances;
    }
}
