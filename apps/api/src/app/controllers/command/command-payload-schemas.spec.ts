import { getCoscradDataSchema } from '@coscrad/data-types';
import { CreateMediaItem } from '../../../domain/models/media-item/commands/create-media-item.command';
import { CreateSong } from '../../../domain/models/song/commands/create-song.command';
import { PublishSong } from '../../../domain/models/song/commands/publish-song.command';

/**
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
