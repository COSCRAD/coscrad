import { IMultilingualText, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { useFetchTermsQuery } from './store';

export const findOriginalMultilingualTextItem = (name: IMultilingualText) => {
    const item = name.items.find((item) => item.role === MultilingualTextItemRole.original);

    return item;
};

type TermListingProps = {
    id: string;
    name: IMultilingualText;
    isPublished: boolean;
};

export const TermListing = ({ id, name, isPublished }: TermListingProps): JSX.Element => {
    const linkUrl = `/terms/${id}`;

    const originalTermItem = findOriginalMultilingualTextItem(name);

    return (
        <Typography variant="body1">
            <Link to={linkUrl}>
                {originalTermItem.text}, {isPublished ? 'Published' : 'Not Published'}
            </Link>
        </Typography>
    );
};

export const TermIndex = (): JSX.Element => {
    const { data, isLoading, isError } = useFetchTermsQuery();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (isError) return <div>Error retrieving name.</div>;

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
