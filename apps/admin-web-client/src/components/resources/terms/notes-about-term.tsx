import { useAuth0 } from '@auth0/auth0-react';
import { ITermViewModel } from '@coscrad/api-interfaces';
import { isNonEmptyObject } from '@coscrad/validation-constraints';
import { Stack, Typography } from '@mui/material';
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
                            } = note;

                            return (
                                <Typography
                                    sx={{ marginLeft: '10px' }}
                                    key={`noteid-${id}`}
                                    variant="body1"
                                >
                                    {original.text}
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
