import { getCoscradDataSchema } from '@coscrad/data-types';
import { CreateMediaItem } from '../../../domain/models/media-item/commands/create-media-item.command';
import { CreateSong } from '../../../domain/models/song/commands/create-song.command';
import { PublishSong } from '../../../domain/models/song/commands/publish-song.command';
import { AddUserToGroup } from '../../../domain/models/user-management/group/commands/add-user-to-group/add-user-to-group.command';
import { CreateGroup } from '../../../domain/models/user-management/group/commands/create-group/create-group.command';
import { GrantUserRole } from '../../../domain/models/user-management/user/commands/grant-user-role/grant-user-role.command';
import { RegisterUser } from '../../../domain/models/user-management/user/commands/register-user/register-user.command';

/**
 * TODO [https://www.pivotaltracker.com/story/show/182576828]
 *
 * This is a placeholder. Currently we need to manually register each new
 * command here, but eventually we will have a service that will do this. We should
 * call that service as part of the setup for this test when that time comes.
 * That will make this test completely dynamic.
 */
const getAllCommandSchemas = () =>
    [
        ['CREATE_SONG', CreateSong],
        ['PUBLISH_SONG', PublishSong],
        ['CREATE_MEDIA_ITEM', CreateMediaItem],
        ['REGISTER_USER', RegisterUser],
        ['CREATE_USER_GROUP', CreateGroup],
        ['ADD_USER_TO_GROUP', AddUserToGroup],
        ['GRANT_USER_ROLE', GrantUserRole],
    ].map(([commandType, Ctor]) => [commandType, getCoscradDataSchema(Ctor)]);

describe('command payload schemas', () => {
    getAllCommandSchemas().forEach(([commandType, schema]) => {
        describe(`The schema for command ${commandType}`, () => {
            it('should have the expected value', () => {
                expect(schema).toMatchSnapshot();
            });
        });
    });
});
