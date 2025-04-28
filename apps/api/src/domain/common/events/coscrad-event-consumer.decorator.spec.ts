import { AggregateType } from '@coscrad/api-interfaces';
import { Injectable } from '@nestjs/common';
import { ConsoleCoscradCliLogger } from '../../../coscrad-cli/logging';
import { BaseEvent } from '../../../queries/event-sourcing';
import buildDummyUuid from '../../models/__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../models/__tests__/utilities/dummyDateNow';
import { dummySystemUserId } from '../../models/__tests__/utilities/dummySystemUserId';
import { CoscradEventConsumer } from './coscrad-event-consumer.decorator';
import { ICoscradEventHandler } from './coscrad-event-handler.interface';
import { ICoscradEvent } from './coscrad-event.interface';
import { SyncInMemoryEventPublisher } from './sync-in-memory-event-publisher';

export interface HasHandles {
    handles(e: BaseEvent): boolean;
}

describe('@CoscradEventConsumer', () => {
    @Injectable()
    class CreationCounter {
        private count = 0;

        public increment() {
            this.count++;
        }

        public getCount(): number {
            return this.count;
        }
    }

    describe(`when the matcher applies to an event`, () => {
        @CoscradEventConsumer((baseEvent) => {
            return baseEvent.type.includes('CREATED');
        })
        class FancyHandler implements ICoscradEventHandler {
            constructor(private readonly counter: CreationCounter) {}

            handle(event: ICoscradEvent): Promise<void> {
                if (event.type.toLowerCase().includes('created')) {
                    this.counter.increment();

                    return Promise.resolve();
                }
            }
        }

        class ToyEvent extends BaseEvent {
            readonly type = 'WIDGET_CREATED';
        }

        it(`should add a handles method`, () => {
            const counterToInject = new CreationCounter();

            const testHandler = new FancyHandler(counterToInject);

            expect(typeof (testHandler as unknown as HasHandles).handles).toBe('function');
        });

        it(`should handle a test event`, () => {
            const counterToInject = new CreationCounter();

            const publisher = new SyncInMemoryEventPublisher(new ConsoleCoscradCliLogger());

            publisher.register(new FancyHandler(counterToInject));

            publisher.publish(
                new ToyEvent(
                    {
                        aggregateCompositeIdentifier: {
                            type: 'widget' as AggregateType,
                            id: buildDummyUuid(4),
                        },
                    },
                    {
                        dateCreated: dummyDateNow,
                        userId: dummySystemUserId,
                        id: buildDummyUuid(8),
                    }
                )
            );

            expect(counterToInject.getCount()).toBe(1);
        });
    });

    describe(`when the matcher does not apply to an event`, () => {
        @CoscradEventConsumer((baseEvent) => {
            // note the negation here
            return !baseEvent.type.includes('CREATED');
        })
        class FancyHandler implements ICoscradEventHandler {
            constructor(private readonly counter: CreationCounter) {}

            handle(event: ICoscradEvent): Promise<void> {
                if (event.type.toLowerCase().includes('created')) {
                    this.counter.increment();

                    return Promise.resolve();
                }
            }
        }

        class ToyEvent extends BaseEvent {
            readonly type = 'WIDGET_CREATED';
        }

        it(`should not handle the event`, () => {
            const counterToInject = new CreationCounter();

            const publisher = new SyncInMemoryEventPublisher(new ConsoleCoscradCliLogger());

            publisher.register(new FancyHandler(counterToInject));

            publisher.publish(
                new ToyEvent(
                    {
                        aggregateCompositeIdentifier: {
                            type: 'widget' as AggregateType,
                            id: buildDummyUuid(4),
                        },
                    },
                    {
                        dateCreated: dummyDateNow,
                        userId: dummySystemUserId,
                        id: buildDummyUuid(8),
                    }
                )
            );

            expect(counterToInject.getCount()).toBe(0);
        });
    });
});
