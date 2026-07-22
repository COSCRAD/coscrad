import { useAuth0 } from '@auth0/auth0-react';
import { IMultilingualText, MultilingualTextItemRole, ResourceType } from '@coscrad/api-interfaces';
import { Box, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { PresentFormWithOptionalGeneratedId } from '../../shared/present-form-with-optional-generated-id';
import { CreateTermForm } from './create-term-form';
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

    const { isAuthenticated } = useAuth0();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (isError) return <div>Error retrieving name.</div>;

    const { entities } = data;

    return (
        <>
            <Typography sx={{ flexGrow: 1 }} variant="h2">
                Terms
            </Typography>
            <Box>
                {isAuthenticated ? (
                    <PresentFormWithOptionalGeneratedId
                        form={CreateTermForm}
                        context={{
                            resourceType: ResourceType.term,
                            buttonLabel: 'CREATE TERM',
                        }}
                    />
                ) : null}
            </Box>
            <Stack>
                {entities.map((term) => {
                    const { id, name, isPublished } = term;

                    return (
                        <TermListing
                            key={`term-${id}`}
                            id={id}
                            name={name}
                            isPublished={isPublished}
                        />
                    );
                })}
            </Stack>
        </>
    );
};
