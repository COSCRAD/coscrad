import { getCoscradDataSchema } from '@coscrad/data-types';
import { CreateMediaItem } from '../../domain/models/media-item/commands/create-media-item.command';
import { buildCommandForm } from './buildCommandForm';

describe('buildCommandForm', () => {
    it('should return the expected result', () => {
        const commandSchema = getCoscradDataSchema(CreateMediaItem);

        const form = buildCommandForm(commandSchema);

        expect(form).toMatchSnapshot();
    });
});
