import { getCoscradDataSchema } from '@coscrad/data-types';
import { AddSong } from './add-song.command';

describe('when getting the schema for ADD_SONG command', () => {
    it('should return the correct value', () => {
        const schema = getCoscradDataSchema(AddSong);

        expect(schema).toBeTruthy();

        expect(schema).not.toEqual({});

        expect(schema).toMatchSnapshot();
    });
});
