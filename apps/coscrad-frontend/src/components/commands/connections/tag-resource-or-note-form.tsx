import { AggregateType } from '@coscrad/api-interfaces';
import { isNonEmptyString } from '@coscrad/validation-constraints';
import {
    Box,
    Button,
    FormControl,
    FormGroup,
    MenuItem,
    Select,
    Stack,
    Typography,
} from '@mui/material';
import { useState } from 'react';
import { useLoadableTags } from '../../../store/slices/tagSlice/hooks/use-loadable-tags';
import { ErrorDisplay } from '../../error-display/error-display';
import { Loading } from '../../loading';
import { findOriginalTextItem } from '../../notes/shared/find-original-text-item';

export interface TagResourceOrNoteProps {
    onSubmitForm: (fsa?: { type: string; payload: Record<string, unknown> }) => void;
    bindProps: Record<string, unknown>;
}

export const TagResourceOrNoteForm = ({
    onSubmitForm,
    bindProps,
}: TagResourceOrNoteProps): JSX.Element => {
    const [selectedTagId, setSelectedTagId] = useState<string>(null);

    const { data, isLoading, errorInfo } = useLoadableTags();

    if (isLoading || data === null) return <Loading />;

    if (errorInfo) return <ErrorDisplay {...errorInfo} />;

    const isFormComplete = isNonEmptyString(selectedTagId);

    const { entities: allTags } = data;

    return (
        <Box>
            <Typography variant="h2">Tag Resource or Note</Typography>
            <FormControl fullWidth>
                <Stack>
                    <FormGroup>
                        <Select
                            onChange={(e) => {
                                setSelectedTagId(e.target.value as string);
                            }}
                        >
                            {allTags
                                .map(({ id, name }) => ({
                                    id,
                                    name: findOriginalTextItem(name).text,
                                }))
                                .map(({ id, name }) => (
                                    <MenuItem key={`id`} value={id}>
                                        {name}
                                    </MenuItem>
                                ))}
                        </Select>
                    </FormGroup>
                </Stack>
                <Button
                    disabled={!isFormComplete}
                    data-testid="submit-dynamic-form"
                    onClick={() => {
                        if (!isFormComplete) return;

                        onSubmitForm({
                            type: 'TAG_RESOURCE_OR_NOTE',
                            payload: {
                                ...bindProps,
                                aggregateCompositeIdentifier: {
                                    type: AggregateType.tag,
                                    id: selectedTagId,
                                },
                            },
                        });
                    }}
                >
                    Submit
                </Button>
            </FormControl>
        </Box>
    );
};
