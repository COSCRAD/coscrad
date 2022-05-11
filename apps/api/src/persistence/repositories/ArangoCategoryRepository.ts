import categoryValidator from '../../domain/domainModelValidators/categoryValidator';
import buildInstanceFactory from '../../domain/factories/utilities/buildInstanceFactory';
import { Category } from '../../domain/models/categories/entities/category.entity';
import { ICategoryRepository } from '../../domain/repositories/interfaces/ICategoryRepository';
import { EntityId } from '../../domain/types/ResourceId';
import { InternalError } from '../../lib/errors/InternalError';
import { Maybe } from '../../lib/types/maybe';
import { isNotFound, NotFound } from '../../lib/types/not-found';
import { DTO } from '../../types/DTO';
import { ArangoDatabase } from '../database/arango-database';
import { DatabaseProvider } from '../database/database.provider';
import {
    categoryCollectionID,
    categoryEdgeCollectionID,
} from '../database/types/ArangoCollectionId';
import { HasArangoDocumentDirectionAttributes } from '../database/types/HasArangoDocumentDirectionAttributes';
import convertArangoDocumentHandleToCompositeIdentifier from '../database/utilities/convertArangoDocumentHandleToCompositeIdentifier';
import mapDatabaseDTOToEntityDTO from '../database/utilities/mapDatabaseDTOToEntityDTO';
import { DatabaseDocument } from '../database/utilities/mapEntityDTOToDatabaseDTO';

type CategoryDocument = Omit<DatabaseDocument<DTO<Category>>, 'childrenIDs'>;

type LookupTableForChildrenIDs = Map<EntityId, EntityId[]>;

export default class ArangoCategoryRepository implements ICategoryRepository {
    #instanceFactory = buildInstanceFactory(categoryValidator, Category);

    #arangoDB: ArangoDatabase;

    constructor(arangoDatabaseProvider: DatabaseProvider) {
        this.#arangoDB = arangoDatabaseProvider.getDBInstance();
    }

    async fetchTree(): Promise<(Category | InternalError)[]> {
        const categories = await this.#arangoDB.fetchMany<CategoryDocument>(categoryCollectionID);

        const category_edges = await this.#arangoDB.fetchMany<HasArangoDocumentDirectionAttributes>(
            categoryEdgeCollectionID
        );

        const categoryDTOs = this.#buildCategoryDTOs(categories, category_edges);

        return categoryDTOs.map((dto) => this.#instanceFactory(dto));
    }

    async fetchById(id: EntityId): Promise<Maybe<Category | InternalError>> {
        const categoryDocument = await this.#arangoDB.fetchById<CategoryDocument>(
            id,
            categoryCollectionID
        );

        if (isNotFound(categoryDocument)) return NotFound;

        const edgesWhereThisCategoryIsTheParent = await this.#arangoDB
            .fetchMany<HasArangoDocumentDirectionAttributes>(categoryEdgeCollectionID)
            .then((edges) =>
                edges.filter(
                    ({ _from }) => convertArangoDocumentHandleToCompositeIdentifier(_from).id === id
                )
            );

        const childrenIDs = this.#buildLookupTableForChildrenIDs(
            edgesWhereThisCategoryIsTheParent
        ).get(id);

        const categoryDTO = mapDatabaseDTOToEntityDTO({
            ...categoryDocument,
            childrenIDs,
            // TODO Remove cast
        }) as DTO<Category>;

        return this.#instanceFactory(categoryDTO);
    }

    async count(): Promise<number> {
        return await this.#arangoDB.getCount(categoryCollectionID);
    }

    // Break this out. It doesn't use any state (this)
    #buildCategoryDTOs(
        categories: CategoryDocument[],
        edges: HasArangoDocumentDirectionAttributes[]
    ) {
        const lookupTable = this.#buildLookupTableForChildrenIDs(edges);

        return categories
            .map((categoryDoc) => ({
                ...categoryDoc,
                childrenIDs: lookupTable.has(categoryDoc._key)
                    ? lookupTable.get(categoryDoc._key)
                    : [],
            }))
            .map(mapDatabaseDTOToEntityDTO);
    }

    // Break this out. It doesn't have any state.
    #buildLookupTableForChildrenIDs(
        edges: HasArangoDocumentDirectionAttributes[]
    ): LookupTableForChildrenIDs {
        return edges.reduce((parentToChildrenMap: LookupTableForChildrenIDs, { _from, _to }) => {
            if (!_from) {
                throw new InternalError('Missing _from attribute');
            }

            if (!_to) {
                throw new InternalError('Missing _to attribute');
            }

            const parentId = convertArangoDocumentHandleToCompositeIdentifier(_from).id;

            const childId = convertArangoDocumentHandleToCompositeIdentifier(_to).id;

            if (!parentToChildrenMap.has(parentId)) parentToChildrenMap.set(parentId, []);

            parentToChildrenMap.get(parentId).push(childId);

            return parentToChildrenMap;
        }, new Map());
    }
}
