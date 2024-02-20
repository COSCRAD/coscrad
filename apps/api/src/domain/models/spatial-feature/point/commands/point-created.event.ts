import { CoscradEvent } from '../../../../../domain/common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { CreatePoint } from './create-point.command';

export type PointCreatedPayload = CreatePoint;

@CoscradEvent('POINT_CREATED')
export class PointCreated extends BaseEvent<PointCreatedPayload> {
    readonly type = 'POINT_CREATED';
}
