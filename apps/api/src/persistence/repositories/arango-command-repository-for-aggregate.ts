import { Inject } from '@nestjs/common';
import { Aggregate } from '../../domain/models/aggregate.entity';
import { BaseEvent } from '../../domain/models/shared/events/base-event.entity';
import { IRepositoryForAggregate } from '../../domain/repositories/interfaces/repository-for-aggregate.interface';
import { ISpecification } from '../../domain/repositories/interfaces/specification.interface';
import { AggregateCompositeIdentifier } from '../../domain/types/AggregateCompositeIdentifier';
import { AggregateId } from '../../domain/types/AggregateId';
import { AggregateType } from '../../domain/types/AggregateType';
import { Maybe } from '../../lib/types/maybe';
import { DTO } from '../../types/DTO';
import { ResultOrError } from '../../types/ResultOrError';
import { ArangoEventRepository } from './arango-event-repository';

type AggregateContextIdentifier =
    | AggregateCompositeIdentifier
    | Pick<AggregateCompositeIdentifier, 'type'>;

export interface IEventRepository {
    fetchEvents(aggregateContextIdentifier: AggregateContextIdentifier): Promise<BaseEvent[]>;

    // TODO Should the event be an instance or DTO?
    appendEvent(event: DTO<BaseEvent>): Promise<void>;
}

export abstract class ArangoCommandRepositoryForAggregate<TAggregate extends Aggregate>
    implements IRepositoryForAggregate<TAggregate>
{
    protected readonly aggregateType: AggregateType;

    constructor(
        @Inject(ArangoEventRepository) protected readonly eventRepository: IEventRepository,
        protected readonly snapshotRepositoryForAggregate: IRepositoryForAggregate<TAggregate>
    ) {}

    abstract fetchById(id: AggregateId): Promise<Maybe<ResultOrError<TAggregate>>>;

    abstract fetchMany(
        specification?: ISpecification<TAggregate>
    ): Promise<ResultOrError<TAggregate>[]>;

    abstract getCount(specification?: ISpecification<TAggregate>): Promise<number>;

    abstract create(entity: TAggregate): Promise<void>;

    abstract createMany(entities: TAggregate[]): Promise<void>;

    abstract update(entity: TAggregate): Promise<void>;
}
