import { useAuth0 } from '@auth0/auth0-react';
import { isNonEmptyObject } from '@coscrad/validation-constraints';
import { Divider, Stack, Typography } from '@mui/material';
import { CreateNoteAboutResourceContainer } from '../../notes/create-note-about-resource-container';
import { useFetchNotesAboutTermQuery } from '../../notes/store/notes.api';

type NotesAboutTermProps = {
    termId: string;
};

export const NotesAboutTerm = ({ termId }: NotesAboutTermProps): JSX.Element => {
    const { isAuthenticated } = useAuth0();

    const { data, isLoading, error } = useFetchNotesAboutTermQuery(termId);

    if (error) {
        if ('status' in error) {
            // you can access all properties of `FetchBaseQueryError` here
            const errMsg = 'error' in error ? error.error : JSON.stringify(error.data);

            return (
                <div>
                    <div>An error has occurred:</div>
                    <div>{errMsg}</div>
                </div>
            );
        }
        // you can access all properties of `SerializedError` here
        return <div>{error.message}</div>;
    }

    if (isLoading || !data) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <Stack sx={{ marginTop: '20px' }}>
                {isNonEmptyObject(data.notes) ? (
                    <>
                        <Typography variant="h6">Notes:</Typography>
                        {Object.values(data.notes).map((note) => {
                            const { id, note: text } = note;

                            return (
                                <Typography key={`noteid-${id}`} variant="body1">
                                    {text.original.text}
                                </Typography>
                            );
                        })}
                    </>
                ) : (
                    <Typography variant="body1">There are no notes for this term.</Typography>
                )}
            </Stack>
            <Divider sx={{ height: '20px', marginBottom: '10px' }} />
            {isAuthenticated ? (
                <CreateNoteAboutResourceContainer resourceId={termId} resourceType="term" />
            ) : null}
        </>
    );
};
