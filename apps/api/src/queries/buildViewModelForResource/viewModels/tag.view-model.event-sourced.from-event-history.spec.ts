import { LanguageCode } from '@coscrad/api-interfaces';
import buildDummyUuid from '../../../domain/models/__tests__/utilities/buildDummyUuid';
import { TagCreated } from '../../../domain/models/tag/commands/create-tag/tag-created.event';
import { TestEventStream } from '../../../test-data/events/test-event-stream';
import { EventSourcedTagViewModel } from './tag.view-model.event-sourced';
describe(`EventSourcedTagViewModel.fromEventHistory`, () => {
    const tagId = buildDummyUuid(1);

    const label = 'rodents';

    const tagCreated = new TestEventStream()
        .andThen<TagCreated>({
            type: 'TAG_CREATED',
            payload: {
                label,
            },
        })
        .as({
            id: tagId,
        });

    describe(`when a tag is first created`, () => {
        const eventHistory = tagCreated;

        const result = new EventSourcedTagViewModel(tagId).applyStream(eventHistory);

        it(`should apply the appropriate label and name`, () => {
            const { name } = result;

            const originalTextItemForName = name.getOriginalTextItem();

            expect(originalTextItemForName.text).toBe(label);

            // Currently, we only support English monolingual tag labels
            expect(originalTextItemForName.languageCode).toBe(LanguageCode.English);
        });
    });
});
