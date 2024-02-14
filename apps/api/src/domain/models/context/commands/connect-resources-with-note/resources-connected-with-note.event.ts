import { CoscradEvent } from '../../../../../domain/common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { ConnectResourcesWithNote } from './connect-resources-with-note.command';

export type ResourcesConnectedWithNotePayload = ConnectResourcesWithNote;

@CoscradEvent('RESOURCES_CONNECTED_WITH_NOTE')
export class ResourcesConnectedWithNote extends BaseEvent<ResourcesConnectedWithNotePayload> {
    readonly type = 'RESOURCES_CONNECTED_WITH_NOTE';
}
