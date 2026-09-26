import { useAuth0 } from '@auth0/auth0-react';
import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Box, Button, Stack, TextField } from '@mui/material';
import { LatLng } from 'leaflet';
import { useState } from 'react';
import { useFetchIdQuery } from '../../id-generation/store';
import { LanguageSelect } from '../../shared/language-select';
import { useExecuteSpatialFeatureCommandMutation } from './store/spatial-feature.api';

interface CreatePointFormProps {
    coordinates: LatLng;
}

interface SpatialFeaturePropertiesForCommand {
    name: string;
    languageCodeForName: LanguageCode;
    description: string;
}

export const CreatePointForm = ({ coordinates }: CreatePointFormProps): JSX.Element => {
    const { data: generatedId, isLoading: isIdLoading, isError: isIdError } = useFetchIdQuery();

    const [
        executeSpatialFeatureCommand,
        { isLoading: isRequestInProgress, isError: isCommandError },
    ] = useExecuteSpatialFeatureCommandMutation();

    const [properties, setProperties] = useState<SpatialFeaturePropertiesForCommand>(null);

    const { isAuthenticated } = useAuth0();

    if (!isAuthenticated) return <div>Form Unavailable</div>;

    if (isIdLoading) {
        return <div>Loading Id...</div>;
    }

    if (isIdError) return <div>Error retrieving id.</div>;

    if (isRequestInProgress) {
        return <div>Processing Command Request...</div>;
    }

    if (isCommandError) return <div>Error Processing Command Request.</div>;

    const { lat, lng } = coordinates;

    const isDisabled =
        isNullOrUndefined(properties) ||
        properties.name.length === 0 ||
        !Object.values(LanguageCode).includes(properties.languageCodeForName);

    const handleSubmit = async (event) => {
        event.preventDefault();

        console.log(
            'Form sent to server:',
            properties.name,
            properties.languageCodeForName,
            properties.description
        );

        return;

        executeSpatialFeatureCommand({
            commandFsa: {
                type: 'CREATE_POINT',
                payload: {
                    aggregateCompositeIdentifier: {
                        type: AggregateType.spatialFeature,
                        id: generatedId,
                    },
                    lattitude: lat,
                    longitude: lng,
                    name: properties.name,
                    languageCodeForName: properties.languageCodeForName,
                    description: properties.description,
                },
            },
        });

        setTimeout(() => {
            executeSpatialFeatureCommand({
                commandFsa: {
                    type: 'PUBLISH_RESOURCE',
                    payload: {
                        aggregateCompositeIdentifier: {
                            type: AggregateType.spatialFeature,
                            id: generatedId,
                        },
                    },
                },
            });
        }, 600);
    };

    return (
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ width: '450px' }}>
            <div data-testid="create-term-form" />
            <Stack>
                <TextField
                    sx={{ width: '80%', mb: 1 }}
                    data-testid={`place_name`}
                    label={'Place Name'}
                    onChange={(e) => {
                        setProperties({ ...properties, name: e.target.value });
                    }}
                ></TextField>
                <TextField
                    sx={{ width: '80%', mb: 1 }}
                    data-testid={`place_description`}
                    label={'Place Description'}
                    onChange={(e) => {
                        setProperties({ ...properties, description: e.target.value });
                    }}
                ></TextField>
                <LanguageSelect
                    languageCodesInUse={[]}
                    onSelectLanguage={(newLanguageCode: LanguageCode) => {
                        setProperties({ ...properties, languageCodeForName: newLanguageCode });
                    }}
                />
                <Button
                    data-testid={`submit-term`}
                    variant="contained"
                    disabled={isDisabled}
                    type="submit"
                >
                    ADD PLACE
                </Button>
            </Stack>
        </Box>
    );
};
