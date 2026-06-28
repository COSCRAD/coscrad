import { IMultilingualText, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { useFetchTermsQuery } from './store';

export const findOriginalMultilingualTextItem = (name: IMultilingualText) => {
    const item = name.items.find((item) => item.role === MultilingualTextItemRole.original);

    return item.text;
};

type TermListingProps = {
    id: string;
    name: IMultilingualText;
    isPublished: boolean;
};

export const TermListing = ({ id, name, isPublished }: TermListingProps): JSX.Element => {
    const linkUrl = `/terms/${id}`;

    return (
        <Typography variant="body1">
            <Link to={linkUrl}>
                {findOriginalMultilingualTextItem(name)},{' '}
                {isPublished ? 'Published' : 'Not Published'}
            </Link>
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
            {entities.map((term) => {
                const { id, name, isPublished } = term;

                return (
                    <TermListing key={`term-${id}`} id={id} name={name} isPublished={isPublished} />
                );
            })}
        </Stack>
    );
};
