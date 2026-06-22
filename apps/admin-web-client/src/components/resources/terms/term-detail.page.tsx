import { Stack, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useFetchTermByIdQuery } from './store';
import { findOriginalMultilingualTextItem } from './term-index.page';

export const TermDetail = (): JSX.Element => {
    const { id } = useParams();

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
        </>
    );
};
