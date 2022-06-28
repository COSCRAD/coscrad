import { Command, ICommand } from '@coscrad/commands';
import { UUID } from '@coscrad/data-types';
import { AggregateId } from '../../../types/AggregateId';

@Command({
    type: 'PUBLISH_MEDIA_ITEM',
    label: 'Publish Media Item',
    description: 'Makes this media item available to the public',
})
export class PublishMediaItem implements ICommand {
    @UUID()
    id: AggregateId;
}
