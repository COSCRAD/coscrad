import { ResourceType } from '@coscrad/api-interfaces';
import { Button, Drawer } from '@mui/material';
import { Box } from '@mui/system';
import { useState } from 'react';
import { SelectedCategorizablesOfSingleTypeContainer } from '../../../../../components/higher-order-components/selected-categorizables-of-single-type.container';
import { thumbnailCategorizableDetailPresenterFactory } from '../../../../../components/resources/factories/thumbnail-categorizable-detail-presenter-factory';
import { ConnectedResource } from '../../../notes/hooks';
import { buildPluralLabelsMapForCategorizableTypes } from './build-plural-labels-map-for-categorizable-types';

type SelectedResourcesMap = Map<ResourceType, string[]>;

interface Props {
    data: ConnectedResource[];
}

/**
 * Strictly speaking, this is not a presenter. It is a nested container.
 * We rely on
 * - first fetching the resource
 * - then given the resource, fetching its connections
 * - for each connected resource type, fetching the given resources in the `SelectedResourcesContainer`
 */
export const CategorizablesOfManyTypesPanelPresenter = ({
    data: categorizablesOfManyTypes,
}: Props): JSX.Element => {
    if (categorizablesOfManyTypes.length === 0)
        return (
            <div data-testid={'categorizablesOfManyTypesPanel'}>
                <h2>Connected Resources</h2>
                No Connections Found
            </div>
        );

    /**
     * We only need to show the resource types that are connected to the resource
     * of focus (the one whose detail page we are in) here. So we make sure to
     * create selected resources views for only the resource types we need, so
     * not to needlessly trigger fetches. We are lazy-loading resources here,
     * on a "fetch all the first time the resource type is seen" basis.
     */
    const relevantResourceTypesWithDuplicates = categorizablesOfManyTypes.map(
        ({ compositeIdentifier: { type } }) => type
    );

    // Remove duplicates
    const uniqueResourceTypes = [...new Set(relevantResourceTypesWithDuplicates)];

    /**
     * We initialize an empty map so we don't have to clutter the reducer below
     * with the "set if not has" logic.
     *
     * Do we really need to start with the unique resource types?
     */
    const emptyMap: SelectedResourcesMap = uniqueResourceTypes.reduce(
        (accMap, resourceType) => accMap.set(resourceType, []),
        new Map()
    );

    const resourceTypeToIds: SelectedResourcesMap = categorizablesOfManyTypes.reduce(
        (acc: SelectedResourcesMap, { compositeIdentifier: { type: resourceType, id } }) =>
            acc.set(resourceType, [...acc.get(resourceType), id]),
        emptyMap
    );

    /**
     * Temporary logic for drawer
     */

    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <>
            <Box sx={{ mt: 2.5 }}>
                <Button variant="contained" onClick={handleDrawerToggle}>
                    Connected Resources
                </Button>
            </Box>

            <Drawer
                variant="temporary"
                anchor="right"
                open={mobileOpen}
                onClose={handleDrawerToggle}
            >
                <div data-testid={'CategorizablesOfManyTypesPanel'}>
                    <Box sx={{ padding: 2 }}>
                        <h2>Connected Resources</h2>
                        {uniqueResourceTypes.map((resourceType) => (
                            /**
                             * Note that the connected resources panel uses the thumbnail presenters.
                             * If later we'd like to support mobile, we should inject the
                             * correct thumbnail detail presenter factory here based on a config context.
                             *
                             * These Categorizables should be passed into panel presenter as props
                             */
                            <SelectedCategorizablesOfSingleTypeContainer
                                key={resourceType}
                                categorizableType={resourceType}
                                selectedIds={resourceTypeToIds.get(resourceType)}
                                detailPresenterFactory={
                                    thumbnailCategorizableDetailPresenterFactory
                                }
                                pluralLabelForCategorizableType={buildPluralLabelsMapForCategorizableTypes().get(
                                    resourceType
                                )}
                            />
                        ))}
                    </Box>
                </div>
            </Drawer>
        </>
    );
};
