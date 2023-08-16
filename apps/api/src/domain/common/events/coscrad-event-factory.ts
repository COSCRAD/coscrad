import { UnionFactory } from '@coscrad/data-types';
import { Injectable } from '@nestjs/common';
import { Ctor } from '../../../lib/types/Ctor';
import { DTO } from '../../../types/DTO';
import { BaseEvent } from '../../models/shared/events/base-event.entity';
import { COSCRAD_EVENT_UNION } from './constants';

@Injectable()
export class CoscradEventFactory {
    private readonly unionFactory: UnionFactory;

    constructor(dataClassCtors: Ctor<unknown>[]) {
        this.unionFactory = new UnionFactory(dataClassCtors, COSCRAD_EVENT_UNION);
    }

    build<T extends BaseEvent = BaseEvent>(eventDocument: DTO<BaseEvent>): T {
        return this.unionFactory.build(eventDocument) as T;
    }
}
