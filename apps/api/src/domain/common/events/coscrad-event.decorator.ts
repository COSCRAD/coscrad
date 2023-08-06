import { UnionMember } from '@coscrad/data-types';
import { COSCRAD_EVENT_UNION } from './constants';

export function CoscradEvent(eventType: string): ClassDecorator {
    return UnionMember(COSCRAD_EVENT_UNION, eventType);
}
