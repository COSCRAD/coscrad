import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { AqlQuery } from 'arangojs/aql';
import { AggregateId } from '../../../types/AggregateId';
import { BaseEvent } from '../../shared/events/base-event.entity';
import { CoscradDate } from '../../user-management/utilities';

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

    translateName(
        id: AggregateId,
        text: String,
        languageCode: LanguageCode,
        role: MultilingualTextItemRole
    ): AqlQuery {
        const query = `
            FOR doc IN @@collectionName
            FILTER doc._key == @id
            let newItem = {
                        text: @text,
                        languageCode: @languageCode,
                        role: @role
            }
            UPDATE doc WITH {
                name: {
                    items: APPEND(doc.name.items,newItem)
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

        return {
            query,
            bindVars,
        };
    }

    attribute(resourceId: AggregateId, event: BaseEvent): AqlQuery {
        const query = `
                FOR doc IN @@collectionName
                FILTER doc._key == @id
                LET contributorsForThisEvent = (
                    FOR contributorId IN @contributorIds
                    FOR c IN contributors
                    FILTER c._key == contributorId
                    RETURN c
                )
                LET listOfContributors = (
                    for c in contributorsForThisEvent
                    return CONCAT_SEPARATOR(' ',[c.fullName.firstName,c.fullName.lastName])
                )
                LET contributorIds = (
                    for c in contributorsForThisEvent
                    return c._key
                )
                LET attribution = CONCAT(@template,LENGTH(listOfContributors)>0 ? CONCAT_SEPARATOR(', ',listOfContributors) : "admin")
                LET newContributions = {
                    type: @eventType,
                    contributorIds,
                    statement: attribution,
                    date: @date,
                    timestamp: @timestamp
                }
                LET updatedContributions = APPEND(doc.contributions,newContributions)
                UPDATE doc WITH {
                    contributions: updatedContributions
                } IN @@collectionName
                 RETURN updatedContributions
                `;

        const bindVars = {
            '@collectionName': this.collectionName,
            id: resourceId,
            contributorIds: event.meta.contributorIds || [],
            template: event.buildAttributionStatement(),
            date: CoscradDate.fromUnixTimestamp(event.meta.dateCreated),
            timestamp: event.meta.dateCreated,
            eventType: event.type,
        };

        return {
            query,
            bindVars,
        };
    }
}
