import assertErrorAsExpected from '../../../lib/__tests__/assertErrorAsExpected';
import { NotFound } from '../../../lib/types/not-found';
import { TestEventStream } from '../../../test-data/events';
import InvariantValidationError from '../../domainModelValidators/errors/InvariantValidationError';
import { AggregateType } from '../../types/AggregateType';
import buildDummyUuid from '../__tests__/utilities/buildDummyUuid';
import { TagRelabelled } from './commands';
import { TagCreated } from './commands/create-tag/tag-created.event';
import { ResourceOrNoteTagged } from './commands/tag-resource-or-note/resource-or-note-tagged.event';
import { Tag } from './tag.entity';

const tagId = buildDummyUuid(1);

const label = 'trees';

const newLabel = 'plants';

const aggregateCompositeIdentifier = {
    type: AggregateType.tag,
    id: tagId,
};

const taggedMemberCompositeIdentifier = {
    type: AggregateType.digitalText,
    id: buildDummyUuid(2),
};

const tagCreated = new TestEventStream().andThen<TagCreated>({
    type: 'TAG_CREATED',
    payload: {
        label,
    },
});

const resourceOrNoteTagged = tagCreated.andThen<ResourceOrNoteTagged>({
    type: 'RESOURCE_OR_NOTE_TAGGED',
    payload: {
        taggedMemberCompositeIdentifier,
    },
});

const tagRelabelled = tagCreated.andThen<TagRelabelled>({
    type: 'TAG_RELABELLED',
    payload: {
        newLabel,
    },
});

describe(`Tag.fromEventHistory`, () => {
    describe(`when the event history is valid`, () => {
        describe(`when there is a creation event`, () => {
            it(`should create a tag with the appropriate label`, () => {
                const result = Tag.fromEventHistory(
                    tagCreated.as(aggregateCompositeIdentifier),
                    tagId
                );

                expect(result).toBeInstanceOf(Tag);

                const tag = result as Tag;

                expect(tag.label).toBe(label);

                expect(tag.members).toHaveLength(0);
            });
        });

        describe(`when a resource has been tagged`, () => {
            it(`should add a corresponding member to the tag`, () => {
                const result = Tag.fromEventHistory(
                    resourceOrNoteTagged.as(aggregateCompositeIdentifier),
                    tagId
                );

                expect(result).toBeInstanceOf(Tag);

                const tag = result as Tag;

                expect(tag.isFor(taggedMemberCompositeIdentifier)).toBe(true);
            });
        });

        describe(`when a tag has been relabelled`, () => {
            const result = Tag.fromEventHistory(
                tagRelabelled.as(aggregateCompositeIdentifier),
                tagId
            );

            expect(result).toBeInstanceOf(Tag);

            const tag = result as Tag;

            expect(tag.label).toBe(newLabel);
        });
    });

    describe(`when there are no events for the given tag`, () => {
        it(`should return not found`, () => {
            const result = Tag.fromEventHistory(
                tagRelabelled.as({
                    type: AggregateType.tag,
                    id: buildDummyUuid(123),
                }),
                tagId
            );

            expect(result).toBe(NotFound);
        });
    });

    // This would probably be due to botched event versioning
    describe(`when there is an invalid event history`, () => {
        const invalidHistory = tagCreated
            .andThen<TagRelabelled>({
                type: 'TAG_RELABELLED',
                payload: {
                    /**
                     * The command would have never emitted an event with an empty label.
                     * This represents invalid existing data.
                     */
                    newLabel: '',
                },
            })
            .as(aggregateCompositeIdentifier);

        const result = Tag.fromEventHistory(invalidHistory, tagId);

        assertErrorAsExpected(
            result,
            new InvariantValidationError(aggregateCompositeIdentifier, [])
        );
    });

    describe(`when the creation event is missing`, () => {
        it(`should throw an error`, () => {
            const eventSource = () => {
                Tag.fromEventHistory(
                    // omit the creation event
                    tagRelabelled.as(aggregateCompositeIdentifier).slice(1),
                    tagId
                );
            };

            expect(eventSource).toThrow();
        });
    });
});
