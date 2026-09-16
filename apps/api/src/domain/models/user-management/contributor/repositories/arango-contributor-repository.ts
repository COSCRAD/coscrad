import { UserQueryOptions } from '../../../../../app/controllers/resources/term.controller';
import buildInstanceFactory from '../../../../../domain/factories/utilities/buildInstanceFactory';
import { InternalError, isInternalError } from '../../../../../lib/errors/InternalError';
import { ArangoCollectionId } from '../../../../../persistence/database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import mapDatabaseDocumentToAggregateDTO from '../../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDocument from '../../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { ArangoRepositoryForAggregate } from '../../../../../persistence/repositories/arango-repository-for-aggregate';
import { CoscradContributorViewModel } from '../../../../../queries/buildViewModelForResource/viewModels/coscrad-contributor.view-model';
import { CoscradContributor } from '../entities';
import { ICoscradContributorQueryRepository } from '../interfaces';

export class ArangoContributorRepository
    extends ArangoRepositoryForAggregate<CoscradContributor>
    implements ICoscradContributorQueryRepository
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

    async fetchMany(queryOptions?: UserQueryOptions) {
        const result = await this.arangoDatabaseForEntitysCollection.fetchForUser(queryOptions);

        if (isInternalError(result)) {
            throw new InternalError(
                `Encountered an unexpected database error when fetching all contributors`,
                [result]
            );
        }

        const { selected, count } = result;

        const buildResult = selected.map((doc) => {
            const dto = mapDatabaseDocumentToAggregateDTO(doc);

            const newDto = new CoscradContributor(dto);

            const contributorName = newDto.getName();

            const contributorFullNameString = newDto.fullName.toString();

            const allNewDto = {
                ...newDto,
                name: contributorName,
                fullName: contributorFullNameString,
            };

            return CoscradContributorViewModel.fromDto(allNewDto);
        });

        return {
            entities: buildResult,
            // TODO return this from the AQL query as well as it resolves the actual pagination params to use by applying defaults
            page: queryOptions?.pagination?.page || 1,
            count,
        };
    }
}
