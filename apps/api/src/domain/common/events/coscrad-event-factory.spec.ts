import { bootstrapDynamicTypes } from '@coscrad/data-types';
import buildDummyUuid from '../../models/__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../models/__tests__/utilities/dummySystemUserId';
import { BaseEvent } from '../../models/shared/events/base-event.entity';
import { AggregateType } from '../../types/AggregateType';
import { CoscradEventFactory } from './coscrad-event-factory';
import { CoscradEventUnion } from './coscrad-event-union';
import { CoscradEvent } from './coscrad-event.decorator';

@CoscradEvent('WIDGET_CREATED')
class WidgetCreated extends BaseEvent {
    type = 'WIDGET_CREATED';
}

const dummyCreateWidgetCommand = {
    aggregateCompositeIdentifier: {
        id: buildDummyUuid(123),
        type: 'widget' as AggregateType,
    },
    size: 'xl',
    locationId: 1,
};

@CoscradEvent(`WIDGET_RELOCATED`)
class WidgetRelocated extends BaseEvent {
    type = 'WIDGET_RELOCATED';
}

const allCtors = [WidgetCreated, WidgetRelocated, CoscradEventUnion];

const mockDataFinderService = {
    bootstrapDynamicTypes: async () => {
        throw new Error(`Not Implemented`);
    },
    getAllDataClassCtors: async () => allCtors,
};

describe(`CoscradEventFactory`, () => {
    beforeAll(() => {
        bootstrapDynamicTypes(allCtors);
    });

    describe(`.build(...)`, () => {
        describe(`when the event document is of a registered type`, () => {
            const eventId = buildDummyUuid(5);

            const widgetCreatedDto = new WidgetCreated(
                dummyCreateWidgetCommand,
                eventId,
                dummySystemUserId
            ).toDTO();

            it(`should build an event instance`, async () => {
                // @ts-expect-error TODO Use Jest mocks for this
                const coscradEventFactory = new CoscradEventFactory(mockDataFinderService);

                const instance = await coscradEventFactory.build(widgetCreatedDto);

                expect(instance).toBeInstanceOf(BaseEvent);

                expect(instance).toBeInstanceOf(WidgetCreated);

                expect(instance.id).toBe(eventId);

                // Note that currently, we simply copy the command payload across to the event
                expect(instance.payload).toEqual(dummyCreateWidgetCommand);
            });
        });
    });
});
