import getCoscradDataSchemea from '../../../../../../../libs/data-types/src/lib/utilities/getCoscradDataSchemea';
import { AddSong } from './add-song.command';

describe('when getting the schema for ADD_SONG command', () => {
    it('should return the correct value', () => {
        const schema = getCoscradDataSchemea(Object.getPrototypeOf(AddSong));

        expect(schema).not.toEqual({});

        expect(schema).toMatchSnapshot();
    });
});
