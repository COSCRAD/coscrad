import { MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { Box, Stack, Typography } from '@mui/material';
import { useFetchTermByIdQuery } from './store';
import { findOriginalMultilingualTextItem } from './term-index.page';

type TermDetailPageProps = {
    id: string;
};

export const TermDetail = ({ id }: TermDetailPageProps): JSX.Element => {
    console.log(`${TermDetail.name} rendered.`);

    const { name, isLoading, isError } = useFetchTermByIdQuery(id, {
        selectFromResult: (result) => ({
            name: result.data?.name,
            isLoading: result.isLoading,
            isError: result.isError,
        }),
    });

    if (isLoading || !name) {
        return <div>Loading...</div>;
    }

    if (isError) return <div>Error retrieving name.</div>;

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
                                <Typography
                                    key={`${item.role}-${item.languageCode}`}
                                    variant="body1"
                                >
                                    {item.text} ({item.languageCode}, {item.role})
                                </Typography>
                            ))}
                    </Stack>
                </Box>
            ) : null}
        </>
    );
};
