import { NotFound } from '../../../lib/types/not-found';
import {
    ArangoQueryRepository,
    ArangoQueryRepositoryMeta,
    getArangoQueryRepositoryMeta,
} from './arango-query-repository.decorator';

describe(`ArangoQueryRepository`, () => {
    const WIDGET_RESOURCE_TYPE = 'widget';

    @ArangoQueryRepository({
        type: WIDGET_RESOURCE_TYPE,
    })
    class WidgetQueryRepository {}

    describe(`getArangoQueryRepositoryMeta`, () => {
        describe(`when the target has been annotated`, () => {
            it(`should return the expected metadata`, () => {
                const result = getArangoQueryRepositoryMeta(WidgetQueryRepository);

                expect(result).not.toBe(NotFound);

                const { type: foundResourceType, collectionName } =
                    result as ArangoQueryRepositoryMeta;

                expect(foundResourceType).toBe(WIDGET_RESOURCE_TYPE);

                expect(collectionName).toBe('widget__VIEWS');
            });
        });

        describe(`when the target has not been annotated`, () => {
            class NotAQueryRepo {}

            it(`should return not found`, () => {
                const result = getArangoQueryRepositoryMeta(NotAQueryRepo);

                expect(result).toBe(NotFound);
            });
        });
    });
});
