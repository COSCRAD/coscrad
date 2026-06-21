import { IMultilingualText, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { Stack, Typography } from '@mui/material';
import { useFetchTermsQuery } from './store';

const findOriginalMultilingualTextItem = (name: IMultilingualText) => {
    const item = name.items.find((item) => item.role === MultilingualTextItemRole.original);

    return item.text;
};

type TermListingProps = {
    name: IMultilingualText;
    isPublished: boolean;
};

export const TermListing = ({ name, isPublished }: TermListingProps): JSX.Element => {
    return (
        <Typography variant="body1">
            {findOriginalMultilingualTextItem(name)}, {isPublished ? 'Published' : 'Not Published'}
        </Typography>
    );
};

export const TermIndex = (): JSX.Element => {
    const { data, isLoading, error } = useFetchTermsQuery();

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

    const { entities } = data;

    return (
        <Stack>
            {entities.map((term) => (
                <TermListing name={term.name} isPublished={term.isPublished} />
            ))}
        </Stack>
    );
};
