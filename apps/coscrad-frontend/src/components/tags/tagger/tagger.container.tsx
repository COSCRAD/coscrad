import {
    AggregateType,
    CategorizableCompositeIdentifier,
    FormFieldType,
} from '@coscrad/api-interfaces';
import { isNonEmptyString, isNull } from '@coscrad/validation-constraints';
import { Button } from '@mui/material';
import { useState } from 'react';
import { useAppDispatch } from '../../../app/hooks';
import { executeCommand } from '../../../store/slices/command-status';
import { useLoadableTags } from '../../../store/slices/tagSlice/hooks/use-loadable-tags';
import { buildFormFieldForAggregates } from '../../dynamic-forms/dynamic-form-elements/dynamic-select';
import { StaticSelect } from '../../dynamic-forms/dynamic-form-elements/static-select';
import { ErrorDisplay } from '../../error-display/error-display';
import { Loading } from '../../loading';
import { aggregateStringSummarizerFactory } from '../../resources/factories/aggregate-string-summarizer-factory';

interface TaggerContainerProps {
    // the note or resource to tag
    compositeIdentifier: CategorizableCompositeIdentifier;
}

const COMMAND_TYPE = 'TAG_RESOURCE_OR_NOTE';

const buildFSA = (
    taggedMemberCompositeIdentifier: CategorizableCompositeIdentifier,
    tagId: string
) => ({
    type: COMMAND_TYPE,
    payload: {
        aggregateCompositeIdentifier: {
            type: AggregateType.tag,
            id: tagId,
        },
        taggedMemberCompositeIdentifier,
    },
});

export const TaggerContainer = ({ compositeIdentifier }: TaggerContainerProps): JSX.Element => {
    const { type: categorizableType, id: categorizableId } = compositeIdentifier;

    const { isLoading: areTagsStillLoading, errorInfo, data: tagIndexResult } = useLoadableTags();

    const [currentTagId, setCurrentTagId] = useState<string>('');

    const dispatch = useAppDispatch();

    if (areTagsStillLoading || isNull(tagIndexResult)) return <Loading />;

    if (errorInfo) return <ErrorDisplay {...errorInfo} />;

    /**
     * We filter out tags that are already in use by this note or resource in order
     * to avoid the user pointlessly attempting commands that will result in
     * invalid state transition errors.
     */
    const unusedTags = tagIndexResult.entities.filter(({ members }) =>
        members.some(({ type, id }) => type === categorizableType && id !== categorizableId)
    );

    const currentTag = isNonEmptyString(currentTagId)
        ? tagIndexResult.entities.find(({ id }) => id === currentTagId)
        : null;

    /**
     * Note that we are hard-wiring this single command because it is going to
     * appear outside of its aggregate context (Tag detail).
     */

    return (
        <div>
            <h3> Add a Tag</h3>
            <StaticSelect
                formField={buildFormFieldForAggregates(
                    unusedTags,
                    {
                        type: FormFieldType.dynamicSelect,
                        name: `aggregateCompositeIdentifier`,
                        description: `system-wide unique ID for a tag`,
                        label: 'tag',
                        // TODO Make this field required
                        constraints: [],
                    },
                    aggregateStringSummarizerFactory(AggregateType.tag)
                )}
                onNewSelection={(_, value: string) => setCurrentTagId(value)}
                currentValue={currentTag?.label || ''}
            />
            <Button
                onClick={() => {
                    dispatch(executeCommand(buildFSA(compositeIdentifier, currentTagId)));
                }}
            >
                Submit
            </Button>
        </div>
    );
};
