import { getCoscradDataSchema } from '@coscrad/data-types';
import { CreateMediaItem } from '../../domain/models/media-item/commands/create-media-item/create-media-item.command';
import { MediaItem } from '../../domain/models/media-item/entities/media-item.entity';
import { buildCommandForm } from './buildCommandForm';

describe('buildCommandForm', () => {
    it('should return the expected result', () => {
        const commandSchema = getCoscradDataSchema(CreateMediaItem);

        const form = buildCommandForm(commandSchema, MediaItem);

        expect(form).toMatchSnapshot();
    });
});
