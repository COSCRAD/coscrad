import {
    AGGREGATE_COMPOSITE_IDENTIFIER,
    LanguageCode,
    ResourceType,
} from '@coscrad/api-interfaces';
import { CommandFSA } from '../../../../app/controllers/command/command-fsa/command-fsa.entity';
import { NotFound, isNotFound } from '../../../../lib/types/not-found';
import { clonePlainObjectWithOverrides } from '../../../../lib/utilities/clonePlainObjectWithOverrides';
import { buildTestCommandFsaMap } from '../../../../test-data/commands';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../__tests__/utilities/dummyDateNow';
import { dummySystemUserId } from '../../__tests__/utilities/dummySystemUserId';
import { GrantResourceReadAccessToUser } from '../../shared/common-commands/grant-user-read-access/grant-resource-read-access-to-user.command';
import { ResourceReadAccessGrantedToUser } from '../../shared/common-commands/grant-user-read-access/resource-read-access-granted-to-user.event';
import { BaseEvent } from '../../shared/events/base-event.entity';
import {
    AddPageToDigitalText,
    CreateDigitalText,
    DigitalTextCreated,
    PageAddedToDigitalText,
} from '../commands';
import { ADD_PAGE_TO_DIGITAL_TEXT } from '../constants';
import { DigitalText } from './digital-text.entity';

const id = buildDummyUuid(153);

const testFsaMap = buildTestCommandFsaMap();

const digitalTextTitle = `Foo Bar Baz Text`;

const languageCodeForTitle = LanguageCode.Haida;

const createDigitalText = clonePlainObjectWithOverrides(
    testFsaMap.get(`CREATE_DIGITAL_TEXT`) as CommandFSA<CreateDigitalText>,
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

const dummyPageIdentifier = '21';

const addPageToDigitalText = clonePlainObjectWithOverrides(
    testFsaMap.get(ADD_PAGE_TO_DIGITAL_TEXT) as CommandFSA<AddPageToDigitalText>,
    {
        payload: {
            aggregateCompositeIdentifier: { id },
            identifier: dummyPageIdentifier,
        },
    }
);

const pageAddedForDigitalText = new PageAddedToDigitalText(
    addPageToDigitalText.payload,
    buildDummyUuid(155),
    dummySystemUserId
);

const idForUserWithAccessToDigitalText = buildDummyUuid(45);

/**
 * TODO: note that the aggregate composite identifier should be for the resource
 * and not the user.
 *
 * We need to fix the grantResourceReadAccessToUser command
 */
const grantReadAccessToUserForDigitalText = clonePlainObjectWithOverrides(
    // TODO: export constant for the following command type
    testFsaMap.get(
        'GRANT_RESOURCE_READ_ACCESS_TO_USER'
    ) as CommandFSA<GrantResourceReadAccessToUser>,
    {
        payload: {
            aggregateCompositeIdentifier: { type: ResourceType.digitalText, id },
            userId: idForUserWithAccessToDigitalText,
        },
    }
);

const digitalTextReadAccessGrantedToUser = new ResourceReadAccessGrantedToUser(
    grantReadAccessToUserForDigitalText.payload,
    buildDummyUuid(579),
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

        describe(`when a page has been added`, () => {
            it(`should have the corresponding page`, () => {
                const eventStream = [digitalTextCreated, pageAddedForDigitalText];

                const digitalTextBuildResult = DigitalText.fromEventHistory(eventStream, id);

                expect(digitalTextBuildResult).toBeInstanceOf(DigitalText);

                const doesDigitalTextHavePageWithDummyIdentifier = (
                    digitalTextBuildResult as DigitalText
                ).hasPage(dummyPageIdentifier);

                expect(doesDigitalTextHavePageWithDummyIdentifier).toBe(true);
            });
        });

        describe(`when a user has not been granted read access to an unpublished digital text`, () => {
            it(`should not allow access to the user`, () => {
                // Note that there is no RESOURCE_PUBLISHED event here
                const eventStream = [digitalTextCreated, pageAddedForDigitalText];

                const digitalTextBuildResult = DigitalText.fromEventHistory(eventStream, id);

                expect(digitalTextBuildResult).toBeInstanceOf(DigitalText);

                const digitalText = digitalTextBuildResult as DigitalText;

                expect(
                    digitalText.queryAccessControlList.canUser(idForUserWithAccessToDigitalText)
                ).toBe(false);
            });
        });

        describe(`when a user has been granted read access to an unpublished digital text`, () => {
            it(`should allow access to the user`, () => {
                // Note that there is no RESOURCE_PUBLISHED event here
                const eventStream = [
                    digitalTextCreated,
                    pageAddedForDigitalText,
                    digitalTextReadAccessGrantedToUser,
                ];

                const digitalTextBuildResult = DigitalText.fromEventHistory(eventStream, id);

                expect(digitalTextBuildResult).toBeInstanceOf(DigitalText);

                const digitalText = digitalTextBuildResult as DigitalText;

                expect(
                    digitalText.queryAccessControlList.canUser(idForUserWithAccessToDigitalText)
                ).toBe(true);
            });
        });
    });

    // Should this describe be moved up to be a part of the first nested describe above?
    describe(`when the first event is not a creation event for the given aggregate root`, () => {
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