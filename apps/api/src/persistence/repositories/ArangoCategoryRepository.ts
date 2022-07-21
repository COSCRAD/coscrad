import categoryValidator from '../../domain/domainModelValidators/categoryValidator';
import buildInstanceFactory from '../../domain/factories/utilities/buildInstanceFactory';
import { Category } from '../../domain/models/categories/entities/category.entity';
import { ICategoryRepository } from '../../domain/repositories/interfaces/category-repository.interface';
import { AggregateId } from '../../domain/types/AggregateId';
import { InternalError } from '../../lib/errors/InternalError';
import { Maybe } from '../../lib/types/maybe';
import { isNotFound, NotFound } from '../../lib/types/not-found';
import { DTO } from '../../types/DTO';
import { ArangoDatabase } from '../database/arango-database';
import { ArangoCollectionId } from '../database/collection-references/ArangoCollectionId';
import { DatabaseProvider } from '../database/database.provider';
import { CategoryDocument } from '../database/types/CategoryDocument';
import { HasArangoDocumentDirectionAttributes } from '../database/types/HasArangoDocumentDirectionAttributes';
import buildCategoryDTOsFromDatabaseDocuments from '../database/utilities/category/buildCategoryDTOsFromDatabaseDocuments';
import buildLookupTableForChildrenIDs from '../database/utilities/category/buildLookupTableForChildrenIDs';
import convertArangoDocumentHandleToCompositeIdentifier from '../database/utilities/convertArangoDocumentHandleToCompositeIdentifier';
import mapDatabaseDTOToEntityDTO from '../database/utilities/mapDatabaseDTOToEntityDTO';

export default class ArangoCategoryRepository implements ICategoryRepository {
    #instanceFactory = buildInstanceFactory(categoryValidator, Category);

    #arangoDB: ArangoDatabase;

    constructor(arangoDatabaseProvider: DatabaseProvider) {
        this.#arangoDB = arangoDatabaseProvider.getDBInstance();
    }

    async fetchTree(): Promise<(Category | InternalError)[]> {
        const categories = await this.#arangoDB.fetchMany<CategoryDocument>(
            ArangoCollectionId.categories
        );

        const category_edges = await this.#arangoDB.fetchMany<HasArangoDocumentDirectionAttributes>(
            ArangoCollectionId.categoryEdgeCollectionID
        );

        const categoryDTOs = buildCategoryDTOsFromDatabaseDocuments(categories, category_edges);

        return categoryDTOs.map((dto) => this.#instanceFactory(dto));
    }

    async fetchById(id: AggregateId): Promise<Maybe<Category | InternalError>> {
        const categoryDocument = await this.#arangoDB.fetchById<CategoryDocument>(
            id,
            ArangoCollectionId.categories
        );

        if (isNotFound(categoryDocument)) return NotFound;

        const edgesWhereThisCategoryIsTheParent = await this.#arangoDB
            .fetchMany<HasArangoDocumentDirectionAttributes>(
                ArangoCollectionId.categoryEdgeCollectionID
            )
            .then((edges) =>
                edges.filter(
                    ({ _from }) => convertArangoDocumentHandleToCompositeIdentifier(_from).id === id
                )
            );

        const childrenIDs = buildLookupTableForChildrenIDs(edgesWhereThisCategoryIsTheParent).get(
            id
        );

        const categoryDTO = mapDatabaseDTOToEntityDTO({
            ...categoryDocument,
            childrenIDs,
            // TODO Remove cast
        }) as DTO<Category>;

        return this.#instanceFactory(categoryDTO);
    }

    async count(): Promise<number> {
        return await this.#arangoDB.getCount(ArangoCollectionId.categories);
    }
}
