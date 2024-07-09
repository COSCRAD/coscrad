import { FormFieldType, ResourceCompositeIdentifier, ResourceType } from '@coscrad/api-interfaces';
import { Box, MenuItem, Select } from '@mui/material';
import { useState } from 'react';
import { DynamicSelect } from '../dynamic-forms/dynamic-form-elements/dynamic-select';
import { thumbnailCategorizableDetailPresenterFactory } from '../resources/factories/thumbnail-categorizable-detail-presenter-factory';
import { AggregateDetailContainer } from './aggregate-detail-container';

interface GlobalSearchProps {
    onNewSelection?: (resourceCompositeIdentifier: ResourceCompositeIdentifier) => void;
}

export const GlobalSearch = ({ onNewSelection }: GlobalSearchProps) => {
    const [selectedResourceType, setSelectedResourceType] = useState<ResourceType>(null);

    const [selectedId, setSelectedId] = useState<string>(null);

    return (
        <Box>
            <Select
                data-testid="global_resourceType_select"
                value={selectedResourceType || ''}
                onChange={(e) => {
                    setSelectedResourceType(e.target.value as ResourceType);
                }}
            >
                {Object.values(ResourceType).map((resourceType) => (
                    <MenuItem key={resourceType} value={resourceType}>
                        {resourceType}
                    </MenuItem>
                ))}
            </Select>
            {selectedResourceType ? (
                <DynamicSelect
                    aggregateType={selectedResourceType}
                    onNewSelection={(_, value) => {
                        setSelectedId(value as string);

                        onNewSelection({
                            type: selectedResourceType,
                            id: value as string,
                        });
                    }}
                    currentValue={selectedId}
                    required={true}
                    simpleFormField={{
                        label: 'selected resource',
                        name: 'global_resourceId',
                        constraints: [],
                        type: FormFieldType.dynamicSelect,
                        description: `the resource to which you'd like to make a connection`,
                    }}
                />
            ) : null}
            {selectedResourceType && selectedId ? (
                <AggregateDetailContainer
                    compositeIdentifier={{ type: selectedResourceType, id: selectedId }}
                    detailPresenterFactory={thumbnailCategorizableDetailPresenterFactory}
                />
            ) : null}
        </Box>
    );
};
