import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { AqlQuery } from 'arangojs/aql';
import { ConnectionRecordForResourceViewModel } from '../../../../queries/buildViewModelForResource/viewModels';
import { NoteRecordForResourceViewModel } from '../../../../queries/buildViewModelForResource/viewModels/note-record-for-resource.view-model';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import { AggregateId } from '../../../types/AggregateId';
import { IResourceConnectionDto } from '../../context/commands/connect-resources-with-note/resources-connected-with-note.event-handler';
import { INoteCreationDto } from '../../context/commands/create-note-about-resource/note-about-resource-created.event-handler';
import { ContributionSummary } from '../../user-management';

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

    createNoteAbout(resourceId: AggregateId, { noteId, context, text }: INoteCreationDto) {
        const query = `
        FOR doc IN @@collectionName
        FILTER doc._key == @resourceId
        LET newNotes = {
            [@newNote.id]: @newNote
        }
        UPDATE doc WITH {
            notes: doc.notes == null ? newNotes : MERGE(doc.notes,newNotes)
        }
        IN @@collectionName
        RETURN NEW
        `;

        const newNote = new NoteRecordForResourceViewModel({
            id: noteId,
            context,
            note: {
                original: {
                    languageCode: text.items[0].languageCode,
                    text: text.items[0].text,
                },
                translations: {},
            },
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
            otherCompositeIdentifier,
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
