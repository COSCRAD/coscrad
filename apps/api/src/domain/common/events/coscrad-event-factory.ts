import { Injectable } from '@nestjs/common';
import { DTO } from '../../../types/DTO';
import { DynamicDataTypeFinderService } from '../../../validation';
import { BaseEvent } from '../../models/shared/events/base-event.entity';

@Injectable()
export class CoscradEventFactory {
    constructor(private readonly dynamicDataTypeFinderService: DynamicDataTypeFinderService) {}

    build<T extends BaseEvent = BaseEvent>(eventDocument: DTO<BaseEvent>): T {
        /**
         * TODO We need to make the mapping layer from DTO to constructor
         * explicit and safely typed. It is difficult to come to the conclusion
         * that this must be updated when we update the API of the BaseEvent
         * constructor.
         */
        return this.dynamicDataTypeFinderService.unionFactory.build(
            eventDocument.type,
            eventDocument.payload,
            eventDocument.meta
        ) as T;
    }
}
