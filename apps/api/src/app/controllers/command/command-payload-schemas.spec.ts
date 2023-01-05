import { ICommand } from '@coscrad/commands';
import { getCoscradDataSchema } from '@coscrad/data-types';
import { CreateBookBibliographicReference } from '../../../domain/models/bibliographic-reference/book-bibliographic-reference/commands/create-book-bibliographic-reference/create-book-bibliographic-reference.command';
import { CreateCourtCaseBibliographicReference } from '../../../domain/models/bibliographic-reference/court-case-bibliographic-reference/commands/create-court-case-bibliographic-reference.command';
import { CreateJournalArticleBibliographicReference } from '../../../domain/models/bibliographic-reference/journal-article-bibliographic-reference/commands/create-journal-article-bibliographic-reference.command';
import { GrantResourceReadAccessToUser } from '../../../domain/models/shared/common-commands/grant-user-read-access/grant-resource-read-access-to-user.command';
import { AddUserToGroup } from '../../../domain/models/user-management/group/commands/add-user-to-group/add-user-to-group.command';
import { CreateGroup } from '../../../domain/models/user-management/group/commands/create-group/create-group.command';
import { GrantUserRole } from '../../../domain/models/user-management/user/commands/grant-user-role/grant-user-role.command';
import { RegisterUser } from '../../../domain/models/user-management/user/commands/register-user/register-user.command';
import { Ctor } from '../../../lib/types/Ctor';

type CommandTypeAndCtor = [string, Ctor<ICommand>];

const commandTypesAndCtors: CommandTypeAndCtor[] = [
    // TODO We should be getting these from `createTestModule`
    ['REGISTER_USER', RegisterUser],
    ['CREATE_USER_GROUP', CreateGroup],
    ['ADD_USER_TO_GROUP', AddUserToGroup],
    ['GRANT_RESOURCE_READ_ACCESS_TO_USER', GrantResourceReadAccessToUser],
    ['GRANT_USER_ROLE', GrantUserRole],
    ['CREATE_BOOK_BIBLIOGRAPHIC_REFERENCE', CreateBookBibliographicReference],
    ['CREATE_JOURNAL_ARTICLE_BIBLIOGRAPHIC_REFERENCE', CreateJournalArticleBibliographicReference],
    ['CREATE_COURT_CASE_BIBLIOGRAPHIC_REFERENCE', CreateCourtCaseBibliographicReference],
];

/**
 * TODO [https://www.pivotaltracker.com/story/show/182576828]
 *
 * This is a placeholder. Currently we need to manually register each new
 * command here, but eventually we will have a service that will do this. We should
 * call that service as part of the setup for this test when that time comes.
 * That will make this test completely dynamic.
 */
const getAllCommandSchemas = () =>
    commandTypesAndCtors.map(([commandType, Ctor]) => [commandType, getCoscradDataSchema(Ctor)]);

describe('command payload schemas', () => {
    getAllCommandSchemas().forEach(([commandType, schema]) => {
        describe(`The schema for command ${commandType}`, () => {
            it('should have the expected value', () => {
                expect(schema).toMatchSnapshot();
            });
        });
    });
});
