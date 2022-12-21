import { Command, ICommand } from '@coscrad/commands';
import { UUID } from '@coscrad/data-types';
import { AggregateId } from '../../../types/AggregateId';

/**
 * TODO remove publish commands in favor of a single `PUBLISH_ENTITY` or
 * `PUBLISH_RESOURCE` command.
 */
@Command({
    type: 'PUBLISH_MEDIA_ITEM',
    label: 'Publish Media Item',
    description: 'Makes this media item available to the public',
})
export class PublishMediaItem implements ICommand {
    @UUID({
        label: 'ID',
        description: 'unique identifier of the media item to publish',
    })
    id: AggregateId;
}
