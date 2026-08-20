import { AggregateType } from '@coscrad/api-interfaces';
import { Autocomplete, Box, Button, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import {
    ContributorsForTerm,
    useFetchContributorsQuery,
} from '../../shared/contributions/contributors.api';
import { useExecuteTermCommandMutation } from './store';

export const CONTRIBUTION_TYPE = 'Term spoken';

interface AttributeTermToSpeakerProps {
    generatedId?: string;
    context: {
        resourceId: string;
        buttonLabel: string;
    };
    onClose: () => void;
}

export const AttributeTermToSpeaker = ({
    context,
    onClose,
}: AttributeTermToSpeakerProps): JSX.Element => {
    const [speakers, setSpeakers] = useState<ContributorsForTerm[]>(null);

    const { resourceId: termId, buttonLabel } = context;

    const {
        data: contributors,
        isLoading,
        isError: isErrorContributors,
    } = useFetchContributorsQuery();

    const [executeTermCommand, { isLoading: isRequestInProgress, isError }] =
        useExecuteTermCommandMutation();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (isErrorContributors) return <div>Error retrieving contributors.</div>;

    if (isRequestInProgress) {
        return <div>Processing Command Request...</div>;
    }

    if (isError) return <div>Error Processing Command Request.</div>;

    const debugContributors = contributors.map(({ id, label }) => `${id}: ${label}`).join(', ');

    const isDisabled = speakers === null;

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent browser refresh

        const contributorIds = speakers.map(({ id }) => id);

        console.log(
            'Form sent to server:',
            `Speakers: 
        ${speakers.map(({ label }) => label).join(' | ')} ||| contributorIds: ${contributorIds.join(
                ' | '
            )}`
        );

        executeTermCommand({
            commandFsa: {
                type: 'PROVIDE_ADDITIONAL_CREDITS_FOR_RESOURCE',
                payload: {
                    aggregateCompositeIdentifier: {
                        type: AggregateType.term,
                        id: termId,
                    },
                    contributionType: `${CONTRIBUTION_TYPE}-${Date.now()}`,
                    contributorIds: contributorIds,
                },
            },
            options: {
                speakerNames: speakers.map(({ label }) => label).join(', '),
            },
        });

        onClose();
    };

    return (
        <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{ width: '450px', minHeight: '200px', p: 2 }}
        >
            <div data-testid="add-speaker-for-term-form" />
            <Stack>
                {/* <TextField rows={6} label="debug" value={debugContributors}></TextField> */}
                <Autocomplete
                    multiple
                    onChange={(event: any, newValue: ContributorsForTerm[] | null) => {
                        setSpeakers(newValue);
                    }}
                    options={contributors}
                    sx={{ width: 300 }}
                    renderInput={(params) => <TextField {...params} label="Speaker" />}
                />
                <Button
                    data-testid={`submit-term`}
                    variant="contained"
                    disabled={isDisabled}
                    type="submit"
                >
                    {buttonLabel}
                </Button>
            </Stack>
        </Box>
    );
};
