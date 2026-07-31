import { useAuth0 } from '@auth0/auth0-react';
import { ITermViewModel } from '@coscrad/api-interfaces';
import { isNonEmptyObject } from '@coscrad/validation-constraints';
import { Box, Stack, Typography } from '@mui/material';
import { CreateNoteAboutResourceWithGeneralContextForm } from '../../shared/create-note-about-resource-with-general-context-form';
import { PresentFormWithOptionalGeneratedId } from '../../shared/present-form-with-optional-generated-id';
import { useFetchTermByIdQuery } from './store';

type NotesAboutTermProps = {
    termId: string;
};

export const NotesAboutTerm = ({ termId }: NotesAboutTermProps): JSX.Element => {
    console.log(`${NotesAboutTerm.name} rendered.`);

    const { isAuthenticated } = useAuth0();

    const selectNotesForTerm = (data: ITermViewModel) => {
        return data?.notes;
    };

    const { notesForTerm, isLoading, isError } = useFetchTermByIdQuery(termId, {
        selectFromResult: ({ data, isLoading, isError }) => ({
            notesForTerm: selectNotesForTerm(data),
            isLoading,
            isError,
        }),
    });

    return (
        <>
            <Stack sx={{ marginTop: '20px' }}>
                {isNonEmptyObject(notesForTerm) ? (
                    <>
                        <Typography variant="h5">Notes about term:</Typography>
                        {Object.values(notesForTerm).map((note) => {
                            const {
                                id,
                                note: { original },
                                context: { type },
                            } = note;

                            return (
                                <Box
                                    sx={{
                                        backgroundColor: 'rgb(21, 105, 94, .1)',
                                        mb: 1,
                                        p: 1,
                                    }}
                                    key={`noteid-${id}`}
                                >
                                    <Typography variant="body1">{original.text}</Typography>
                                    <Box sx={{ fontSize: '.5em' }}>Context Type: {type}</Box>
                                </Box>
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
