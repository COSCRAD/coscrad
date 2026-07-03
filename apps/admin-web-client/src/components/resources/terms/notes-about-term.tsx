import { useAuth0 } from '@auth0/auth0-react';
import { isNonEmptyObject } from '@coscrad/validation-constraints';
import { Stack, Typography } from '@mui/material';
import { useFetchNotesAboutTermQuery } from '../../notes/store/notes.api';
import { CreateNoteAboutResourceWithGeneralContextForm } from '../../shared/create-note-about-resource-with-general-context-form';
import { PresentFormWithOptionalGeneratedId } from '../../shared/present-form-with-optional-generated-id';

type NotesAboutTermProps = {
    termId: string;
};

export const NotesAboutTerm = ({ termId }: NotesAboutTermProps): JSX.Element => {
    console.log(`${NotesAboutTerm.name} rendered.`);

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
                        <Typography variant="h5">Notes about term:</Typography>
                        {Object.values(data.notes).map((note) => {
                            const { id, note: text } = note;

                            return (
                                <Typography
                                    sx={{ marginLeft: '10px' }}
                                    key={`noteid-${id}`}
                                    variant="body1"
                                >
                                    {text.original.text}
                                </Typography>
                            );
                        })}
                    </>
                ) : null}
            </Stack>
            {isAuthenticated ? (
                <PresentFormWithOptionalGeneratedId
                    form={CreateNoteAboutResourceWithGeneralContextForm}
                    context={{ resourceId: termId, resourceType: 'term', buttonLabel: 'ADD NOTE' }}
                />
            ) : null}
        </>
    );
};
