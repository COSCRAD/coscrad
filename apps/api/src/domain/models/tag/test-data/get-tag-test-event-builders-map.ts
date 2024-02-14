import { EventBuilder } from '../../../../test-data/events';
import { BaseEvent } from '../../shared/events/base-event.entity';
import { buildResourceOrNoteTagged, buildTagCreatedEvent, buildTagRelabelled } from './builders';

export const getTagTestEventBuildersMap = () =>
    new Map<string, EventBuilder<BaseEvent>>()
        .set('TAG_CREATED', buildTagCreatedEvent)
        .set('RESOURCE_OR_NOTE_TAGGED', buildResourceOrNoteTagged)
        .set('TAG_RELABELLED', buildTagRelabelled);
