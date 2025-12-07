import {
    EdgeConnectionMemberRole,
    EdgeConnectionType,
    IMultilingualTextItem,
    IToken,
    LanguageCode,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserQueryOptions } from '../../../../app/controllers/resources/term.controller';
import { COSCRAD_LOGGER_TOKEN, ICoscradLogger } from '../../../../coscrad-cli/logging';
import { InternalError, isInternalError } from '../../../../lib/errors/InternalError';
import { Maybe } from '../../../../lib/types/maybe';
import { NotFound } from '../../../../lib/types/not-found';
import { clonePlainObjectWithOverrides } from '../../../../lib/utilities/clonePlainObjectWithOverrides';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../../../persistence/database/arango-database';
import { ArangoDatabaseForCollection } from '../../../../persistence/database/arango-database-for-collection';
import mapDatabaseDocumentToAggregateDTO from '../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDocument, {
    ArangoDatabaseDocument,
} from '../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { ConnectionRecordForResourceViewModel } from '../../../../queries/buildViewModelForResource/viewModels';
import { NoteRecordForResourceViewModel } from '../../../../queries/buildViewModelForResource/viewModels/note-record-for-resource.view-model';
import { TermViewModel } from '../../../../queries/buildViewModelForResource/viewModels/term.view-model';
import { ResultOrError } from '../../../../types/ResultOrError';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import { AggregateId } from '../../../types/AggregateId';
import { EventSourcedAudioItemViewModel } from '../../audio-visual/audio-item/queries';
import { IResourceConnectionDto } from '../../context/commands/connect-resources-with-note/resources-connected-with-note.event-handler';
import { INoteCreationDto } from '../../context/commands/create-note-about-resource/note-about-resource-created.event-handler';
import { ContributionSummary } from '../../user-management';
import { CoscradUserWithGroups } from '../../user-management/user/entities/user/coscrad-user-with-groups';
import { AudioCandidatesForTerm, ITermQueryRepository } from '../queries';
import { BaseArangoResourceViewQueryBuilder } from './base-arango-resource-query-builder';

export class ArangoTermQueryRepository implements ITermQueryRepository {
    private readonly database: ArangoDatabaseForCollection<TermViewModel>;

    private readonly baseResourceQueryBuilder: BaseArangoResourceViewQueryBuilder;

    constructor(
        arangoConnectionProvider: ArangoConnectionProvider,
        @Inject(COSCRAD_LOGGER_TOKEN)
        private readonly _logger: ICoscradLogger
    ) {
        this.database = new ArangoDatabaseForCollection(
            new ArangoDatabase(arangoConnectionProvider.getConnection()),
            'term__VIEWS'
        );

        this.baseResourceQueryBuilder = new BaseArangoResourceViewQueryBuilder(`term__VIEWS`);
    }

    async create(view: TermViewModel): Promise<void> {
        const document = mapEntityDTOToDatabaseDocument(view);

        await this.database.create(document).catch((error) => {
            throw new InternalError(error);
        });
    }

    async createMany(views: TermViewModel[]): Promise<void> {
        const documents = views.map(mapEntityDTOToDatabaseDocument);

        return this.database.createMany(documents);
    }

    async publish(id: AggregateId): Promise<void> {
        const query = this.baseResourceQueryBuilder.publish(id);

        const cursor = await this.database.query(query).catch((reason) => {
            throw new InternalError(`Failed to publish term via TermRepository: ${reason}`);
        });

        await cursor.all();
    }

    async tag(termId: string, tagId: string): Promise<void> {
        await this.database.query(this.baseResourceQueryBuilder.tag(termId, tagId));
    }

    async createNoteAbout(resourceId: string, noteCreationDto: INoteCreationDto) {
        await this.database.query(
            this.baseResourceQueryBuilder.createNoteAbout(resourceId, noteCreationDto)
        );
    }

    async createConnection(id: string, dto: IResourceConnectionDto): Promise<void> {
        await this.database.query(this.baseResourceQueryBuilder.connectResourcesWithNote(id, dto));
    }

    /**
     * TODO[https://www.pivotaltracker.com/story/show/188764063] support `unpublish`
     */

    async delete(id: AggregateId): Promise<void> {
        return this.database.delete(id);
    }

    async translate(
        id: AggregateId,
        { text, languageCode, role }: IMultilingualTextItem
    ): Promise<void> {
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
            },
        } IN @@collectionName
         RETURN OLD
        `;

        const bindVars = {
            '@collectionName': 'term__VIEWS',
            id: id,
            text: text,
            role: role,
            languageCode: languageCode,
        };

        const cursor = await this.database
            .query({
                query,
                bindVars,
            })
            .catch((reason) => {
                throw new InternalError(`Failed to translate term via TermRepository: ${reason}`);
            });

        await cursor.all();
    }

    async elicitFromPrompt(
        id: AggregateId,
        { text, languageCode }: Omit<IMultilingualTextItem, 'role'>,
        tokens: IToken[]
    ): Promise<void> {
        /**
         * Note that the only difference between this and `translate` is currently
         * that `elicitFromPrompt` removes "ELICIT_TERM_FROM_PROMPT" from actions.
         * However, we may also want to expose `isPromptTerm` in the future, in which
         * case this property will differ as well.
         */
        const query = `
        FOR doc IN @@collectionName
        FILTER doc._key == @id
        let newItem = {
                    text: @text,
                    languageCode: @languageCode,
                    role: @role
        }
        UPDATE doc WITH {
            actions: REMOVE_VALUE(doc.actions,"ELICIT_TERM_FROM_PROMPT"),
            name: {
                items: APPEND(doc.name.items,newItem)
            },
            tokens: @tokens
        } IN @@collectionName
         RETURN OLD
        `;

        const bindVars = {
            '@collectionName': 'term__VIEWS',
            id: id,
            text: text,
            role: MultilingualTextItemRole.elicitedFromPrompt,
            languageCode: languageCode,
            tokens,
        };

        const cursor = await this.database
            .query({
                query,
                bindVars,
            })
            .catch((reason) => {
                throw new InternalError(
                    `Failed to elicit term from prompt via TermRepository: ${reason}`
                );
            });

        await cursor.all();
    }

    async addAudio(termId: AggregateId, _languageCode: LanguageCode, audioItemId: string) {
        /**
         * TODO We need to find an extensible way to cascade updates across denormalized
         * views.
         *
         * One option is to have a standard `dependents` prop and then update the dependents
         * in a write hook. We should always project nested views off the current state. So
         * we should be able to create a `new TermViewModelForVocabularyList(termView)` and
         * merge with the existing view. One question is how to name these properties.
         */
        const query = `
        FOR term IN @@collectionName
        FILTER term._key == @id
        FOR a IN audioItem__VIEWS
        FILTER a._key == @audioItemId
        UPDATE term WITH {
            actions: REMOVE_VALUE(term.actions,"ADD_AUDIO_FOR_TERM"),
            mediaItemId: a.mediaItemId
        } IN @@collectionName
        `;

        const bindVars = {
            '@collectionName': 'term__VIEWS',
            id: termId,
            audioItemId,
        };

        const cascadeUpdateToVocabularyLists = `
        FOR t IN term__VIEWS
        FILTER t._key == @id
        FOR v IN vocabularyList__VIEWS
        FILTER @id IN (v.entries[*].term.id)[**]
        LET newEntries = (
        FOR e IN v.entries
        RETURN MERGE(e, e.term.id == t._key ? {term: MERGE(e.term, { mediaItemId: t.mediaItemId })} : {})
        )
        UPDATE v with {
            entries: newEntries
        } in vocabularyList__VIEWS
       `;

        const cascadeUpdateBindVars = { id: termId };

        await this.database.getDb().transaction(
            [
                { query, bindVars },
                { query: cascadeUpdateToVocabularyLists, bindVars: cascadeUpdateBindVars },
            ],
            ['term__VIEWS', 'audioItem__VIEWS', 'vocabularyList__VIEWS']
        );
    }

    async addPhotograph(id: AggregateId, photographId: AggregateId) {
        const query = `
        FOR term IN @@collectionName
        FILTER term._key == @id
        FOR p IN photograph__VIEWS
        FILTER p._key == @photographId
        UPDATE term WITH {
            mediaItemId: p.mediaItemIdForPhotograph
        } IN @@collectionName
        `;

        const bindVars = {
            '@collectionName': 'term__VIEWS',
            id,
            photographId,
        };

        const cursor = await this.database.query({
            query,
            bindVars,
        });

        await cursor.all();
    }

    async addVideo(id: AggregateId, videoId: AggregateId) {
        const query = `
        FOR term IN @@collectionName
        FILTER term._key == @id
        FOR v IN video__VIEWS
        FILTER v._key == @videoId
        UPDATE term WITH {
            mediaItemIdForVideo: v.mediaItemId
        } IN @@collectionName
        `;

        const bindVars = {
            '@collectionName': 'term__VIEWS',
            id,
            videoId,
        };

        const cursor = await this.database
            .query({
                query,
                bindVars,
            })
            .catch((e) => {
                throw e;
            });

        await cursor.all();
    }

    // note that it is important to pass APPEND an array of items to append when appending a string value to an existing array
    async allowUser(termId: AggregateId, userId: AggregateId): Promise<void> {
        const aqlQuery = this.baseResourceQueryBuilder.allowUser(termId, userId);

        const cursor = await this.database.query(aqlQuery).catch((reason) => {
            throw new InternalError(
                `Failed to allow user access to term via TermRepository: ${reason}`
            );
        });

        await cursor.all();
    }

    async attribute(termId: AggregateId, contributionSummary: ContributionSummary): Promise<void> {
        const aqlQuery = this.baseResourceQueryBuilder.attribute(termId, contributionSummary);

        await this.database.query(aqlQuery).catch((reason) => {
            throw new InternalError(
                `Failed to add attribution for term via VideoRepository: ${reason}`
            );
        });
    }

    async fetchById(
        id: AggregateId,
        user?: CoscradUserWithGroups
    ): Promise<Maybe<ResultOrError<TermViewModel>>> {
        const collectionId = 'term__VIEWS';

        // const result = await this.database.fetchForUser({
        //     filter: idEquals,
        //     user,
        // });

        const docRef = 'doc';

        const bindVars: Record<string, unknown> = {};

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

        bindVars.isAdmin = user?.isAdmin() || false;

        if (user) {
            bindVars.userId = user.id;

            bindVars.groupIds = user.groups.map(({ id }) => id);

            // if the resource is not published, we need to defer to the ACL list
            filterBlockForUser += `|| (contains(${docRef}.accessControlList.allowedUserIds,@userId)
                || length(intersection(${docRef}.accessControlList.allowedGroupIds,@groupIds)) > 0)
                `;
        }

        // Should we ensure that the query returns the `next` page number \ offset?
        const aqlQueryString = `
                let allResults = (
                    for ${docRef}, edge in 0..1 any "${collectionId}/${id}" graph web_of_knowledge
                    ${filterBlockForUser}
                    return {
                        doc: ${docRef},
                        edge
                    }
                )
        
                return allResults
                `;

        const cursor = await this.database.query({ query: aqlQueryString, bindVars }).catch((e) => {
            throw e;
        });

        const resultsList = await cursor.all();

        const result = resultsList[0];

        if (isInternalError(result)) {
            // TODO We might consider returning this error.
            throw result;
        }

        if (result.length === 0) {
            return NotFound;
        }

        // TODO share this logic with `fetchMany`
        const [{ doc: termDoc }, ...connectedDocsAndEdges] = result;

        const { notes, connections } = connectedDocsAndEdges.reduce(
            (acc, { doc: otherDoc, edge }) => {
                if (edge.connectionType === EdgeConnectionType.self) {
                    const noteRecord: NoteRecordForResourceViewModel = {
                        id: edge._key,
                        note: new MultilingualText(edge.text),
                        context: edge.connectedResources.self.context,
                    };

                    if (!acc.notes.some((note) => note.id === noteRecord.id)) {
                        acc.notes.push(noteRecord);
                    }

                    return acc;
                }

                const myRole =
                    edge._to == `term__VIEWS/${id}`
                        ? EdgeConnectionMemberRole.to
                        : EdgeConnectionMemberRole.from;

                const connection: ConnectionRecordForResourceViewModel = {
                    id: edge._key,
                    note: new MultilingualText(edge.text),
                    selfContext:
                        myRole === EdgeConnectionMemberRole.from
                            ? edge.connectedResources.from.context
                            : edge.connectedResources.to.context,
                    /**
                     * Note that this is the full view DTO for
                     * the other resource, not just a composite identifier.
                     *
                     * TODO Is there any other mapping that neeeds to
                     * be done here?
                     */
                    other: mapDatabaseDocumentToAggregateDTO(otherDoc),
                    otherContext:
                        myRole === EdgeConnectionMemberRole.from
                            ? edge.connectedResources.to.context
                            : edge.connectedResources.from.context,
                    role: EdgeConnectionMemberRole.to,
                };

                acc.connections.push(connection);

                return acc;
            },
            {
                notes: [],
                connections: [],
            }
        );

        const asView = clonePlainObjectWithOverrides(
            mapDatabaseDocumentToAggregateDTO(termDoc as ArangoDatabaseDocument<TermViewModel>),
            {
                notes,
                connections,
            }
        );

        return TermViewModel.fromDto(asView);
    }

    async fetchMany(options?: UserQueryOptions & { user?: CoscradUserWithGroups }) {
        const compiledQuery = this.baseResourceQueryBuilder.fetchManyWithNotes(options);

        if (isInternalError(compiledQuery)) {
            return compiledQuery;
        }

        const cursor = await this.database.query(compiledQuery);

        const resultsList = await cursor.all();

        const result = resultsList[0];

        if (isInternalError(result)) {
            throw new InternalError(
                `Encountered an unexpected database error when fetching all terms`,
                [result]
            );
        }

        const { selected, count } = result;

        const buildResult = selected.map((docsAndEdges) => {
            const [{ doc: termDoc }, ...connectedDocsAndEdges] = docsAndEdges;

            const { notes, connections } = connectedDocsAndEdges.reduce(
                (acc, { doc: otherDoc, edge }) => {
                    if (edge.connectionType === EdgeConnectionType.self) {
                        const noteRecord: NoteRecordForResourceViewModel = {
                            id: edge._key,
                            note: new MultilingualText(edge.text),
                            context: edge.connectedResources.self.context,
                        };

                        if (!acc.notes.some((note) => note.id === noteRecord.id)) {
                            acc.notes.push(noteRecord);
                        }

                        return acc;
                    }

                    const myRole =
                        edge._to == `term__VIEWS/${termDoc.id}`
                            ? EdgeConnectionMemberRole.to
                            : EdgeConnectionMemberRole.from;

                    const connection: ConnectionRecordForResourceViewModel = {
                        id: edge._key,
                        note: new MultilingualText(edge.text),
                        selfContext:
                            myRole === EdgeConnectionMemberRole.from
                                ? edge.connectedResources.from.context
                                : edge.connectedResources.to.context,
                        /**
                         * Note that this is the full view DTO for
                         * the other resource, not just a composite identifier.
                         *
                         * TODO Is there any other mapping that neeeds to
                         * be done here?
                         */
                        other: mapDatabaseDocumentToAggregateDTO(otherDoc),
                        otherContext:
                            myRole === EdgeConnectionMemberRole.from
                                ? edge.connectedResources.to.context
                                : edge.connectedResources.from.context,
                        role: EdgeConnectionMemberRole.to,
                    };

                    acc.connections.push(connection);

                    return acc;
                },
                {
                    notes: [],
                    connections: [],
                }
            );

            const asView = clonePlainObjectWithOverrides(
                mapDatabaseDocumentToAggregateDTO(termDoc as ArangoDatabaseDocument<TermViewModel>),
                {
                    notes,
                    connections,
                }
            );

            return TermViewModel.fromDto(asView);
        });

        return {
            entities: buildResult,
            // TODO return this from the AQL query as well as it resolves the actual pagination params to use by applying defaults
            page: options?.pagination?.page || 1,
            count,
        };
    }

    async count(): Promise<number> {
        return this.database.getCount();
    }

    subscribeToUpdates(): Observable<{ data: { type: string } }> {
        return this.database.getViewUpdateNotifications();
    }

    async indexVocabularyList(id: AggregateId, vocabularyListId: AggregateId): Promise<void> {
        const query = `
        FOR doc IN @@collectionName
        FILTER doc._key == @termId
        FOR vlDoc IN vocabularyList__VIEWS
        FILTER vlDoc._key == @vocabularyListId
        UPDATE doc with { vocabularyLists: APPEND(doc.vocabularyLists,{ id: @vocabularyListId, name: vlDoc.name }) }
        IN @@collectionName
        `;

        const bindVars = {
            '@collectionName': 'term__VIEWS',
            termId: id,
            vocabularyListId,
        };

        const cursor = await this.database.query({ query, bindVars }).catch((reason) => {
            throw new InternalError(
                `Failed to register vocabulary list for term via TermRepository: ${reason}`
            );
        });

        await cursor.all();
    }

    async indexVocabularyLists(termIds: AggregateId[], vocabularyListId: AggregateId) {
        const query = `
        LET newVocabularyListRecords = (
            FOR v IN vocabularyList__VIEWS
            FILTER v._key == @vocabularyListId
            return {
                id: v._key,
                name: v.name
            }
        )
        FOR doc IN @@collectionName
        FILTER CONTAINS_ARRAY(@termIds,doc._key)
        UPDATE doc WITH {
            vocabularyLists: LENGTH(doc.vocabularyLists) == 0 ? newVocabularyListRecords : APPEND(doc.vocabularyLists,newVocabularyListRecords)
        } in @@collectionName
        `;

        const bindVars = {
            '@collectionName': 'term__VIEWS',
            termIds,
            vocabularyListId,
        };

        const cursor = await this.database.query({
            query,
            bindVars,
        });

        await cursor.all();
    }

    /**
     * Read-only query methods
     */
    async discoverAudio(): Promise<AudioCandidatesForTerm[]> {
        /**
         * TODO
         * - include pagination **tag with story now
         *
         * Note that in the query below it is important to check if the possible audio filename
         * parses to a number. In that case, we want an exact match, because there are
         * likely to be many matches in this case. E.g., "12" matches "123", "12293" and so on. Returning
         * all such matches makes the query uselessly slow.
         *
         * However, when the possible audio filename contains non-numeric characters,
         * partial matches are the desired behaviour, because it was common to introduce
         * ad-hoc prefixes and suffixes when naming audio. E.g. "cat" should find "JD_cat_120334".
         */
        const query = `
            FOR t IN term__VIEWS
            FILTER t.mediaItemId == null && LENGTH(t.possibleAudioFilenames) > 0
            LET possibleAudioItems = (
                FOR a in audioItem__VIEWS
                FOR pfn in t.possibleAudioFilenames
                FILTER TO_NUMBER(pfn) == 0 ? CONTAINS(a.name.items[0].text,pfn) : a.name.items[0].text == pfn
                return a
            )
            return { term: t, possibleAudioItems }
        `;

        const cursor = await this.database.query({ query, bindVars: {} });

        const result = await cursor.all();

        // filter + map
        const audioForTerms = result.flatMap(({ term, possibleAudioItems }) => {
            if (possibleAudioItems.length === 0) {
                return [];
            }

            return [
                {
                    term: TermViewModel.fromDto(mapDatabaseDocumentToAggregateDTO(term)),
                    possibleAudioItems: possibleAudioItems.map((audioItem) =>
                        EventSourcedAudioItemViewModel.fromDto(
                            mapDatabaseDocumentToAggregateDTO(audioItem)
                        )
                    ),
                },
            ];
        });

        return audioForTerms;
    }
}
