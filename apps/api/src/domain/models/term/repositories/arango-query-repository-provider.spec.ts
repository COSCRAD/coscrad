import { ResourceType } from '@coscrad/api-interfaces';
import { Maybe } from '../../../../lib/types/maybe';
import { NotFound } from '../../../../lib/types/not-found';
import { ArangoQueryRepository } from '../../../../persistence/repositories/decorators/arango-query-repository.decorator';
import { ArangoQueryRepositoryProvider } from './arango-query-repository-provider';

const RESOURCE_TYPE = 'widget';

class Widget {
    id: string;

    name: string;

    isPublished = false;

    constructor({ id, name }: { id: string; name: string }) {
        this.id = id;

        this.name = name;
    }
}

@ArangoQueryRepository({
    type: RESOURCE_TYPE,
})
class WidgetRepository {
    private readonly widgets = new Map<string, Widget>();

    async create(widget: Widget) {
        if (!this.widgets.has(widget.id)) {
            this.widgets.set(widget.id, widget);
        }
    }

    async fetchById(id: string): Promise<Maybe<Widget>> {
        if (!this.widgets.has(id)) {
            return NotFound;
        }

        return this.widgets.get(id);
    }

    async publish(id: string) {
        if (this.widgets.has(id)) {
            this.widgets.get(id).isPublished = true;
        }
    }
}

describe(`ArangoQueryRepositoryProvider`, () => {
    const queryRepositoryProvider = new ArangoQueryRepositoryProvider();

    describe(`when there is a repository for the given resource type`, () => {
        const widgetRepository = new WidgetRepository();

        beforeAll(async () => {
            queryRepositoryProvider.register(RESOURCE_TYPE, widgetRepository);
        });

        it(`should return a repository`, async () => {
            const result = queryRepositoryProvider.forResource<WidgetRepository>(
                RESOURCE_TYPE as ResourceType
            );

            expect(result).not.toBe(NotFound);

            const testWidget = new Widget({
                id: '123',
                name: 'my widget',
            });

            await result.create(testWidget);

            await result.publish(testWidget.id);

            const updatedWidget = await result.fetchById(testWidget.id);

            expect(updatedWidget).not.toBe(NotFound);

            expect((updatedWidget as Widget).isPublished).toBe(true);
        });
    });

    describe(`when no repository has been registered for the given resource type`, () => {
        it(`should throw`, () => {
            const tryIt = () => {
                queryRepositoryProvider.forResource('whatsit' as ResourceType);
            };

            expect(tryIt).toThrow();
        });
    });
});
