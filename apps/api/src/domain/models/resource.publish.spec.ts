import assertErrorAsExpected from '../../lib/__tests__/assertErrorAsExpected';
import { InternalError } from '../../lib/errors/InternalError';
import { MultilingualText } from '../common/entities/multilingual-text';
import { AggregateCompositeIdentifier } from '../types/AggregateCompositeIdentifier';
import { ResourceType } from '../types/ResourceType';
import ResourceAlreadyPublishedError from './ResourceAlreadyPublishedError';
import buildDummyUuid from './__tests__/utilities/buildDummyUuid';
import { Resource } from './resource.entity';

class Widget extends Resource {
    protected getResourceSpecificAvailableCommands(): string[] {
        throw new Error('Method not implemented.');
    }
    protected validateComplexInvariants(): InternalError[] {
        return [];
    }
    getName(): MultilingualText {
        throw new Error('Method not implemented.');
    }
    protected getExternalReferences(): AggregateCompositeIdentifier[] {
        throw new Error('Method not implemented.');
    }
}

const unpublishedWidget = new Widget({
    type: 'widget' as ResourceType,
    id: buildDummyUuid(1),
    published: false,
    eventHistory: [],
});

describe(`Resource.publish`, () => {
    describe(`when the resource is not yet published`, () => {
        it(`should return an updated, published instance`, () => {
            const result = unpublishedWidget.publish();

            expect(result).toBeInstanceOf(Widget);

            const updatedWidget = result as Widget;

            expect(updatedWidget.published).toBe(true);
        });
    });

    describe(`when the resource is already pubilshed`, () => {
        it(`should return the expected error`, () => {
            // we already  know this will succeed from the happy path test
            const publishedWidget = unpublishedWidget.publish() as Widget;

            const result = publishedWidget.publish();

            assertErrorAsExpected(
                result,
                new ResourceAlreadyPublishedError(publishedWidget.getCompositeIdentifier())
            );
        });
    });
});
