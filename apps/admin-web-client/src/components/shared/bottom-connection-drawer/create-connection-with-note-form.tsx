import { useAuth0 } from '@auth0/auth0-react';
import {
    AggregateType,
    EdgeConnectionContextType,
    LanguageCode,
    ResourceCompositeIdentifier,
} from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Box, Button, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { useFetchIdQuery } from '../../id-generation/store';
import { LanguageSelect } from '../language-select';
import { SinglePropertyPresenter } from '../single-property-presenter';
import { useExecuteCreateConnectionCommandMutation } from './connections.api';

interface CreateConnectionFormProps {
    from: ResourceCompositeIdentifier;
    to: ResourceCompositeIdentifier;
}

export const CreateConnectionWithNoteForm = ({
    from,
    to,
}: CreateConnectionFormProps): JSX.Element => {
    const { isAuthenticated } = useAuth0();

    const [connectionNote, setConnectionNote] = useState<string>('');

    const [languageCode, setLanguageCode] = useState<LanguageCode>(null);

    // Need to update generated id (may be an issue in all CREATE_ commands)
    const {
        data: generatedId,
        isLoading: isIdLoading,
        isError: isIdError,
    } = useFetchIdQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });

    const [
        executeCreateConnectionCommand,
        { isLoading: isRequestInProgress, isError: isCommandError },
    ] = useExecuteCreateConnectionCommandMutation();

    if (!isAuthenticated) return <div>Form Unavailable without login</div>;

    if (isIdLoading) {
        console.log({ generatedId });

        return <div>Loading Id...</div>;
    }

    if (isIdError) return <div>Error retrieving id.</div>;

    if (isRequestInProgress) {
        return <div>Processing Command Request...</div>;
    }

    if (isCommandError) return <div>Error Processing Command Request.</div>;

    const handleClose = () => {
        console.log('close form');
    };

    const handleSubmit = (event) => {
        event.preventDefault(); // Prevent browser refresh

        console.log(
            'Form sent to server:',
            connectionNote,
            languageCode,
            `${from.type}/${from.id} to ${to.type}/${to.id}`,
            `generatedId: ${generatedId}`
        );

        executeCreateConnectionCommand({
            commandFsa: {
                type: 'CONNECT_RESOURCES_WITH_NOTE',
                payload: {
                    aggregateCompositeIdentifier: {
                        type: AggregateType.note,
                        id: generatedId,
                    },
                    toMemberCompositeIdentifier: to,
                    toMemberContext: { type: EdgeConnectionContextType.general },
                    fromMemberCompositeIdentifier: from,
                    fromMemberContext: { type: EdgeConnectionContextType.general },
                    text: connectionNote,
                    languageCode: languageCode,
                },
            },
        });

        handleClose();
    };

    const isDisabled =
        isNullOrUndefined(connectionNote) || !Object.values(LanguageCode).includes(languageCode);

    return (
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ width: '80%', mb: 2 }}>
            <div data-testid="create-point-form" />
            <Stack>
                {!isNullOrUndefined(generatedId) ? (
                    <SinglePropertyPresenter display="Generated Id" value={generatedId} />
                ) : null}
                <TextField
                    sx={{ width: '80%', mb: 1 }}
                    data-testid={`connection_note`}
                    label={'Connection Note'}
                    onChange={(e) => {
                        setConnectionNote(e.target.value);
                    }}
                ></TextField>

                <LanguageSelect
                    languageCodesInUse={[]}
                    onSelectLanguage={(newLanguageCode: LanguageCode) => {
                        setLanguageCode(newLanguageCode);
                    }}
                />
                <Button
                    data-testid={`submit-term`}
                    variant="contained"
                    disabled={isDisabled}
                    type="submit"
                >
                    CONNECT RESOURCES WITH NOTE
                </Button>
            </Stack>
        </Box>
    );
};
