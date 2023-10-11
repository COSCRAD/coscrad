import { AGGREGATE_COMPOSITE_IDENTIFIER, LanguageCode } from '@coscrad/api-interfaces';
import { CommandFSA } from '../../../app/controllers/command/command-fsa/command-fsa.entity';
import { NotFound, isNotFound } from '../../../lib/types/not-found';
import { clonePlainObjectWithOverrides } from '../../../lib/utilities/clonePlainObjectWithOverrides';
import { buildTestCommandFsaMap } from '../../../test-data/commands';
import buildDummyUuid from '../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../__tests__/utilities/dummyDateNow';
import { dummySystemUserId } from '../__tests__/utilities/dummySystemUserId';
import { BaseEvent } from '../shared/events/base-event.entity';
import { CreateDigitalText, DigitalTextCreated } from './commands';
import { DigitalText } from './digital-text.entity';

const id = buildDummyUuid(153);

const textFsaMap = buildTestCommandFsaMap();

const digitalTextTitle = `Foo Bar Baz Text`;

const languageCodeForTitle = LanguageCode.Haida;

const createDigitalText = clonePlainObjectWithOverrides(
    textFsaMap.get(`CREATE_DIGITAL_TEXT`) as CommandFSA<CreateDigitalText>,
    {
        payload: {
            aggregateCompositeIdentifier: { id },
            title: digitalTextTitle,
            languageCodeForTitle,
        },
    }
);

const digitalTextCreated = new DigitalTextCreated(
    createDigitalText.payload,
    buildDummyUuid(154),
    dummySystemUserId
);

describe(`DigitalText.fromEventHistory`, () => {
    describe(`when there are events for the given aggregate root`, () => {
        describe(`when there is only a creation event`, () => {
            const eventStream = [digitalTextCreated];

            it(`should succeed`, () => {
                const digitalTextBuildResult = DigitalText.fromEventHistory(eventStream, id);

                expect(digitalTextBuildResult).toBeInstanceOf(DigitalText);

                const digitalText = digitalTextBuildResult as DigitalText;

                const builtDigitalTextTitle =
                    digitalText.title.getTranslation(languageCodeForTitle);

                if (isNotFound(builtDigitalTextTitle)) {
                    throw new Error(`Digital Text title not found!`);
                }

                expect(builtDigitalTextTitle.text).toBe(digitalTextTitle);
            });
        });
    });

    // Should this describe be moved up to be a part of the first nested describe above?
    describe(`when the first event is not a creation event fo the given aggregate root`, () => {
        class WidgetBobbled extends BaseEvent {
            type = 'WIDGET_BOBBLED';
        }

        const widgetBobbled = new WidgetBobbled(
            {
                aggregateCompositeIdentifier:
                    digitalTextCreated.payload[AGGREGATE_COMPOSITE_IDENTIFIER],
            },
            buildDummyUuid(777),
            dummySystemUserId,
            dummyDateNow
        );

        const eventStream = [widgetBobbled];

        const buildDigitalTextFromEventHistory = () => {
            DigitalText.fromEventHistory(eventStream, id);
        };

        // Another command for DigitalText needs to be implemented first
        it(`should throw`, () => {
            expect(buildDigitalTextFromEventHistory).toThrow();
        });
    });

    describe(`when there are no events for the given Digital Text`, () => {
        const eventStream = [digitalTextCreated];

        const bogusId = buildDummyUuid(457);

        it('should return NotFound', () => {
            const digitalTextBuildResult = DigitalText.fromEventHistory(eventStream, bogusId);

            expect(digitalTextBuildResult).toBe(NotFound);
        });
    });
});
