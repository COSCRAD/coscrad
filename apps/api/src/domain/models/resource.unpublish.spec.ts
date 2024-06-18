import assertErrorAsExpected from '../../lib/__tests__/assertErrorAsExpected';
import { InternalError } from '../../lib/errors/InternalError';
import { MultilingualText } from '../common/entities/multilingual-text';
import { AggregateCompositeIdentifier } from '../types/AggregateCompositeIdentifier';
import { ResourceType } from '../types/ResourceType';
import buildDummyUuid from './__tests__/utilities/buildDummyUuid';
import ResourceNotYetPublishedError from './resource-not-yet-published.error';
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

describe(`Resource.unpublished`, () => {
    const unpublishedWidget = new Widget({
        type: 'widget' as ResourceType,
        id: buildDummyUuid(1),
        published: false,
        eventHistory: [],
    });

    const publishedWidget = unpublishedWidget.clone({
        published: true,
    });

    describe(`when the resource is published`, () => {
        it(`should return the updated, unpublished resource`, () => {
            const result = publishedWidget.unpublish();

            expect(result).toBeInstanceOf(Widget);

            const updatedWidget = result as Widget;

            expect(updatedWidget.published).toBe(false);
        });
    });

    describe(`when the resource is not yet published`, () => {
        const result = unpublishedWidget.unpublish();

        assertErrorAsExpected(
            result,
            new ResourceNotYetPublishedError(unpublishedWidget.getCompositeIdentifier())
        );
    });
});
