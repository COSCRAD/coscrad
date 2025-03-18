import { AqlQuery } from 'arangojs/aql';
import { AggregateId } from '../../../types/AggregateId';

export class ArangoResourceQueryBuilder {
    constructor(private readonly collectionName: string) {}

    publish(id: AggregateId): AqlQuery {
        const query = `
        FOR doc IN @@collectionName
        FILTER doc._key == @id
        UPDATE doc WITH {
            isPublished: true,
            actions: REMOVE_VALUE(doc.actions,"PUBLISH_RESOURCE")
        } IN @@collectionName
        `;

        const bindVars = {
            '@collectionName': this.collectionName,
            id,
        };

        return {
            query,
            bindVars,
        };
    }

    allowUser(resourceId: AggregateId, userId: AggregateId): AqlQuery {
        const query = `
                FOR doc IN @@collectionName
                FILTER doc._key == @id
                UPDATE doc WITH {
                    accessControlList: {
                        allowedUserIds: APPEND(doc.accessControlList.allowedUserIds,[@userId])
                    }
                } IN @@collectionName
                 RETURN OLD
                `;
        // TODO remove return value?

        const bindVars = {
            '@collectionName': this.collectionName,
            id: resourceId,
            userId,
        };

        return {
            query,
            bindVars,
        };
    }

    attribute(resourceId: AggregateId, contributorIds: AggregateId[]): AqlQuery {
        const query = `
                FOR doc IN @@collectionName
                FILTER doc._key == @id
                LET newContributions = (
                    FOR contributorId IN @contributorIds
                        FOR c in contributors
                            FILTER c._key == contributorId
                            return {
                                id: c._key,
                                fullName: CONCAT(CONCAT(c.fullName.firstName,' '),c.fullName.lastName)
                            }
                )
                LET updatedContributions = APPEND(doc.contributions,newContributions)
                UPDATE doc WITH {
                    contributions: updatedContributions
                } IN @@collectionName
                 RETURN updatedContributions
                `;

        const bindVars = {
            '@collectionName': this.collectionName,
            id: resourceId,
            contributorIds,
        };

        return {
            query,
            bindVars,
        };
    }
}
