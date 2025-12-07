import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { isNonEmptyObject, isNonEmptyString } from '@coscrad/validation-constraints';
import { AqlQuery } from 'arangojs/aql';
import { UserQueryOptions } from '../../../../app/controllers/resources/term.controller';
import { compileAqlFilterBlock } from '../../../../lib/coscrad-query-language/aql/compile-aql-filter-block';
import { InternalError, isInternalError } from '../../../../lib/errors/InternalError';
import { ConnectionRecordForResourceViewModel } from '../../../../queries/buildViewModelForResource/viewModels';
import { NoteRecordForResourceViewModel } from '../../../../queries/buildViewModelForResource/viewModels/note-record-for-resource.view-model';
import { ResultOrError } from '../../../../types/ResultOrError';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import { AggregateId } from '../../../types/AggregateId';
import { IResourceConnectionDto } from '../../context/commands/connect-resources-with-note/resources-connected-with-note.event-handler';
import { INoteCreationDto } from '../../context/commands/create-note-about-resource/note-about-resource-created.event-handler';
import { ContributionSummary } from '../../user-management';
import { CoscradUserWithGroups } from '../../user-management/user/entities/user/coscrad-user-with-groups';

export class BaseArangoResourceViewQueryBuilder {
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

    /**
     * TODO This should not access the `tags` collection. It should only
     * access a `tag__VIEWS` collection.
     */
    tag(resourceId: AggregateId, tagId: AggregateId) {
        const query = `
        FOR doc IN @@collectionName
        FILTER doc._key == @resourceId
        LET tagsToAdd = (
            FOR t IN tag__VIEWS
            FILTER t._key == @tagId
            RETURN {
                id: t._key,
                label: t.label
            }
        )
        UPDATE doc WITH  {
            tags: APPEND(doc.tags || [],tagsToAdd)
        }
        IN @@collectionName
        `;

        const bindVars = {
            '@collectionName': this.collectionName,
            resourceId,
            tagId,
        };

        return {
            query,
            bindVars,
        };
    }

    fetchManyWithNotes(
        options?: UserQueryOptions & { user?: CoscradUserWithGroups }
    ): ResultOrError<AqlQuery> {
        const docRef = 'doc';

        const filterCondition = isNonEmptyObject(options?.filter) ? options.filter : undefined;

        let filterBlock: string;

        let letStatements = '';

        const bindVars: Record<string, unknown> = {
            '@collectionName': this.collectionName,
        };

        /**
         * Note that we could use `CoscradQueryLanguage` to `And` the incoming
         * user filter with a `CAN_USER` block. We do not do this, because we want
         * to prevent public users from accessing the `AccessControlList` field
         * in queries as this opens up injection attacks.
         *
         * If there is ever a reason for a resource to name the `accessControlList`
         * property differently, we can make this property name an instance variable
         * for this class.
         */
        let filterBlockForUser = `
                        filter @isAdmin || (has(${docRef},"isPublished") && ${docRef}.isPublished)
                        `;

        bindVars.isAdmin = options?.user?.isAdmin() || false;

        if (options?.user) {
            bindVars.userId = options.user.id;

            bindVars.groupIds = options.user.groups.map(({ id }) => id);

            // if the resource is not published, we need to defer to the ACL list
            filterBlockForUser += `|| (contains(${docRef}.accessControlList.allowedUserIds,@userId)
                        || length(intersection(${docRef}.accessControlList.allowedGroupIds,@groupIds)) > 0)
                        `;
        }

        if (filterCondition) {
            const compileResult = compileAqlFilterBlock(filterCondition, docRef);

            if (isInternalError(compileResult)) {
                return new InternalError(`The query you have provided is invalid.`, [
                    compileResult,
                ]);
            }

            const { bindVars: subqueryBindVars, filterStatement: filterStatements } = compileResult;

            filterBlock = `filter ${filterStatements}`;

            Object.assign(bindVars, subqueryBindVars);

            letStatements = isNonEmptyString(compileResult.letStatement)
                ? compileResult.letStatement
                : '';
        } else {
            filterBlock = '';
        }

        /**
         * We may want to handle this at a higher level (controller \ middleware).
         * This logic guarantees that we do not have the risk of AQL injection,
         * even though the `offset` and `size` are not part of the `bindVars`.
         *
         * The one thing to be careful about is the UX \ DX associated with
         * defaulting to a standard value when the value provided is invalid. It
         * lacks inentionality. Maybe we can do an additional check in the
         * controller \ middleware.
         */

        const DEFAULT_SIZE = 100;

        const MAX_SIZE = 1000;

        const userProvidedSize = options?.pagination?.size;

        const size =
            Number.isInteger(userProvidedSize) &&
            userProvidedSize > 0 &&
            userProvidedSize <= MAX_SIZE
                ? userProvidedSize
                : DEFAULT_SIZE;

        const DEFAULT_OFFSET = 0;

        const userProvidedPage = options?.pagination?.page;

        const offset =
            Number.isInteger(userProvidedPage) && userProvidedPage >= 0
                ? (userProvidedPage - 1) * size
                : DEFAULT_OFFSET;

        const limitBlock = `
                            limit ${offset}, ${size}
                        `;

        const sortBlock = `
                            sort ${docRef}.name.items[0].text, ${docRef}._key
                        `;

        // Should we ensure that the query returns the `next` page number \ offset?
        const aqlQueryString = `
                        let allResults = (
                            for ${docRef} in @@collectionName
                            ${sortBlock}
                            ${letStatements}
                            ${filterBlockForUser}
                            ${filterBlock}
                            let docsAndEdges = (
                                for graphDoc, edge in 0..1 any ${docRef} graph web_of_knowledge
                                return {
                                    doc: graphDoc,
                                    edge
                                }
                            )
        
                            return docsAndEdges
                        )
                
                        let count = (
                            for r in allResults
                            collect with count into l
                            return l
                        )
                
                        let selected = (
                            for r in allResults
                            ${limitBlock}
                            return r
                        )
                
                        return {
                            selected,
                            count: count[0]
                        }
                        `;

        return {
            query: aqlQueryString,
            bindVars,
        };
    }

    // TODO remove this and its use everywhere
    createNoteAbout(resourceId: AggregateId, { noteId, context, text }: INoteCreationDto) {
        const query = `
        FOR doc IN @@collectionName
        FILTER doc._key == @resourceId
        LET newNotes = [@newNote]
        UPDATE doc WITH {
            notes: doc.notes == null ? newNotes : APPEND(doc.notes,newNotes)
        }
        IN @@collectionName
        `;

        const newNote = new NoteRecordForResourceViewModel({
            id: noteId,
            context,
            note: text,
        });

        const bindVars = {
            '@collectionName': this.collectionName,
            resourceId,
            newNote,
        };

        return {
            query,
            bindVars,
        };
    }

    // TODO remove this and its use everywhere
    connectResourcesWithNote(
        id: string,
        {
            otherCompositeIdentifier: otherCompositeIdentifier,
            selfContext,
            otherContext,
            noteId,
            text,
            role,
        }: IResourceConnectionDto
    ) {
        const newConnection = ConnectionRecordForResourceViewModel.fromDto({
            id: noteId,
            selfContext,
            other: otherCompositeIdentifier,
            otherContext,
            note: new MultilingualText(text),
            role,
        }); // .toDto() ?

        const query = `
            FOR doc IN @@collectionName
            FILTER doc._key == @id
            UPDATE doc WITH {
                connections: doc.connections == null ? [@newConnection] : APPEND(doc.connections,[@newConnection])
            } IN @@collectionName
        `;

        const bindVars = {
            '@collectionName': this.collectionName,
            id,
            newConnection,
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
                `;

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

    attribute(resourceId: AggregateId, contributionSummary: ContributionSummary): AqlQuery {
        const query = `
                FOR doc IN @@collectionName
                FILTER doc._key == @id
                LET contributorsForThisEvent = (
                    FOR contributorId IN @summary.contributorIds
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
                LET attribution = CONCAT(@summary.statement,LENGTH(listOfContributors)>0 ? CONCAT_SEPARATOR(', ',listOfContributors) : "(data entry) admin")
                LET newContributions = {
                    type: @summary.type,
                    contributorIds,
                    statement: attribution,
                    date: @summary.date,
                    timestamp: @summary.timestamp
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
            summary: contributionSummary,
        };

        return {
            query,
            bindVars,
        };
    }
}
