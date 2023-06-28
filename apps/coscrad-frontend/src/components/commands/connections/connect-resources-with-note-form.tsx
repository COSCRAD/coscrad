import { LanguageCode, ResourceCompositeIdentifier, isResourceType } from '@coscrad/api-interfaces';
import { isNonEmptyString } from '@coscrad/validation-constraints';
import {
    Box,
    Button,
    FormGroup,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { useState } from 'react';
import { AggregateDetailContainer } from '../../higher-order-components/aggregate-detail-container';
import { GlobalSearch } from '../../higher-order-components/global-search';
import { fullViewCategorizablePresenterFactory } from '../../resources/factories/full-view-categorizable-presenter-factory';

export interface ConnectResourcesWithNoteFormProps {
    /**
     * In the future, we can make this optional. For now the only use case
     * is to bind `CONNECT_RESOURCES_WITH_NOTE` to a resource detail view, with
     * the corresponding resource playing the role of the `from` member.
     */
    fromMemberCompositeIdentifier: ResourceCompositeIdentifier;
    onSubmitForm: (fsa?: { type: string; payload: Record<string, unknown> }) => void;
    bindProps: Record<string, unknown>;
}

export const ConnectResourcesWithNoteForm = ({
    fromMemberCompositeIdentifier,
    onSubmitForm,
    bindProps,
}: ConnectResourcesWithNoteFormProps) => {
    const [text, setText] = useState<string>('');

    const [languageCode, setLanguageCode] = useState<LanguageCode>(null);

    const [toMemberCompositeIdentifier, setToMemberCompositeIdentifier] =
        useState<ResourceCompositeIdentifier>();

    const isFormComplete =
        isNonEmptyString(text) &&
        Object.values(LanguageCode).includes(languageCode) &&
        isResourceType(toMemberCompositeIdentifier?.type) &&
        isNonEmptyString(toMemberCompositeIdentifier?.id);

    return (
        <Box>
            <Stack>
                <Typography variant="h2">Connect Resources with Note</Typography>
                <FormGroup>
                    <TextField
                        id="note_text"
                        name="text"
                        label="note text"
                        value={text}
                        onChange={(e) => {
                            setText(e.target.value);
                        }}
                        multiline
                        required
                    />
                </FormGroup>
                <FormGroup>
                    <Select
                        id="note_languageCode"
                        labelId="note_languageCode-label"
                        value={languageCode || ''}
                        label="language"
                        name="language"
                        placeholder="Choose Language"
                        onChange={(e) => {
                            setLanguageCode(e.target.value as LanguageCode);
                        }}
                        required
                    >
                        {Object.entries(LanguageCode).map(([languageLabel, languageCode]) => (
                            <MenuItem value={languageCode} key={languageCode}>
                                {languageLabel}
                            </MenuItem>
                        ))}
                    </Select>
                </FormGroup>
                <Typography variant="h3">From</Typography>
                <AggregateDetailContainer
                    compositeIdentifier={fromMemberCompositeIdentifier}
                    detailPresenterFactory={fullViewCategorizablePresenterFactory}
                />
                <Typography variant="h3">To</Typography>
                <GlobalSearch
                    onNewSelection={(compositeIdentifier) => {
                        setToMemberCompositeIdentifier({ ...compositeIdentifier });
                    }}
                />
                <Button
                    disabled={!isFormComplete}
                    data-testid="submit-dynamic-form"
                    onClick={() => {
                        if (!isFormComplete) return;

                        onSubmitForm({
                            type: 'CONNECT_RESOURCES_WITH_NOTE',
                            payload: {
                                ...bindProps,
                                /**
                                 * TODO [https://www.pivotaltracker.com/story/show/185475141]
                                 * We need to support the selection of non-trivial context.
                                 */
                                toMemberContext: { type: 'general' },
                                toMemberCompositeIdentifier,
                                fromMemberContext: { type: 'general' },
                                fromMemberCompositeIdentifier,
                                // note that the command executor injects the `aggregateCompositeIdentifier` after generating a new ID
                                languageCode,
                                text,
                            },
                        });
                    }}
                >
                    Submit
                </Button>
            </Stack>
        </Box>
    );
};
