import { ResourceType } from '@coscrad/api-interfaces';
import assertErrorAsExpected from '../../lib/__tests__/assertErrorAsExpected';
import { InternalError } from '../../lib/errors/InternalError';
import { MultilingualText } from '../common/entities/multilingual-text';
import { AggregateCompositeIdentifier } from '../types/AggregateCompositeIdentifier';
import buildDummyUuid from './__tests__/utilities/buildDummyUuid';
import ResourceNotFoundError from './resource-not-found.error';
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

const deletedWidget = new Widget({
    type: 'widget' as ResourceType,
    id: buildDummyUuid(1),
    published: true,
    eventHistory: [],
    hasBeenDeleted: true,
});

const existingWidget = deletedWidget.clone({
    hasBeenDeleted: false,
});

describe(`Resource.delete`, () => {
    describe(`when the resource is not yet deleted`, () => {
        it(`should return an updated, deleted resource`, () => {
            const result = existingWidget.delete();

            expect(result).toBeInstanceOf(Widget);

            const updatedWidget = result as Widget;

            expect(updatedWidget.hasBeenDeleted).toBe(true);
        });
    });

    describe(`when the resource has been deleted`, () => {
        it(`should return the expected error`, () => {
            const deletedWidget = existingWidget.delete() as Widget;

            const result = deletedWidget.delete();

            assertErrorAsExpected(
                result,
                new ResourceNotFoundError(deletedWidget.getCompositeIdentifier())
            );
        });
    });
});
