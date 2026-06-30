import { MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { Box, Stack, Typography } from '@mui/material';
import { useFetchTermByIdQuery } from './store';
import { findOriginalMultilingualTextItem } from './term-index.page';

type TermDetailPageProps = {
    id: string;
};

export const TermDetail = ({ id }: TermDetailPageProps): JSX.Element => {
    console.log(`${TermDetail.name} rendered.`);

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

    const { name } = data;

    const originalTermItem = findOriginalMultilingualTextItem(name);

    return (
        <>
            <Typography variant="h3">Term</Typography>
            <Typography variant="h4">
                {originalTermItem.text} ({originalTermItem.languageCode}, {originalTermItem.role})
            </Typography>
            {name.items.length > 0 ? (
                <Box sx={{ marginTop: '5px' }}>
                    <Typography variant="h5">Translations:</Typography>
                    <Stack sx={{ marginLeft: '7px' }}>
                        {name.items
                            .filter((item) => item.role !== MultilingualTextItemRole.original)
                            .map((item) => (
                                <Typography variant="body1">
                                    {item.text} ({item.languageCode}, {item.role})
                                </Typography>
                            ))}
                    </Stack>
                </Box>
            ) : null}
        </>
    );
};
