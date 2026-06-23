import { AggregateType } from '@coscrad/api-interfaces';
import { Stack, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useAppDispatch } from '../../../app/hooks';
import { executeCommand } from '../../../store/slices/command-status';
import { ImmersiveCreateNoteForm } from './create-note-form';
import { useFetchTermByIdQuery } from './store';
import { findOriginalMultilingualTextItem } from './term-index.page';

export const TermDetail = (): JSX.Element => {
    const { id } = useParams();
    const dispatch = useAppDispatch();

    const { data, isLoading, error } = useFetchTermByIdQuery(id);

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

    const { name, notes } = data;

    const notesArray = Object.values(notes);

    return (
        <>
            <Typography variant="h5">Term: {findOriginalMultilingualTextItem(name)}</Typography>
            <Stack sx={{ marginTop: '20px' }}>
                {notesArray.length > 0 ? (
                    <>
                        <Typography variant="h6">Notes:</Typography>
                        {Object.values(notes).map((note) => {
                            const { note: text } = note;

                            return <Typography variant="body1">{text.original.text}</Typography>;
                        })}
                    </>
                ) : (
                    <Typography variant="body1">There are no notes for this term.</Typography>
                )}
            </Stack>
            <ImmersiveCreateNoteForm
                onSubmit={(text, languageCode, noteId) => {
                    dispatch(
                        executeCommand({
                            type: 'CREATE_NOTE_ABOUT_RESOURCE',
                            payload: {
                                aggregateCompositeIdentifier: {
                                    type: AggregateType.note,
                                    id: noteId,
                                },
                                resourceCompositeIdentifier: {
                                    type: AggregateType.digitalText,
                                    id,
                                },
                                text,
                                languageCode,
                                resourceContext: { type: 'general' },
                            },
                        })
                    );
                }}
            />
        </>
    );
};
