import { UnionFactory } from '@coscrad/data-types';
import { Injectable } from '@nestjs/common';
import { Ctor } from '../../../lib/types/Ctor';
import { DTO } from '../../../types/DTO';
import { DynamicDataTypeFinderService } from '../../../validation';
import { BaseEvent } from '../../models/shared/events/base-event.entity';
import { COSCRAD_EVENT_UNION } from './constants';

@Injectable()
export class CoscradEventFactory {
    private unionFactory: UnionFactory;

    constructor(private readonly dynamicDataTypeFinderService: DynamicDataTypeFinderService) {}

    async build<T extends BaseEvent = BaseEvent>(eventDocument: DTO<BaseEvent>): Promise<T> {
        /**
         * We want the async setup to happen once, after the dynamic data types
         * have been discovered and bootstrapped. This happens after all
         * domain modules have been imported.
         *
         * It would be more elegant to hide this within the dependency injection.
         */
        if (!this.unionFactory) {
            const dataClassCtors = await this.dynamicDataTypeFinderService.getAllDataClassCtors();

            this.unionFactory = new UnionFactory(
                dataClassCtors as Ctor<unknown>[],
                COSCRAD_EVENT_UNION
            );
        }

        return this.unionFactory.build(
            eventDocument.type,
            eventDocument.payload,
            eventDocument.meta.id,
            eventDocument.meta.userId,
            eventDocument.meta.dateCreated
        ) as T;
    }
}
