import { BaseEvent } from './base-event';

export interface ApplyEvent<T> {
    apply(event: BaseEvent): T;
}
