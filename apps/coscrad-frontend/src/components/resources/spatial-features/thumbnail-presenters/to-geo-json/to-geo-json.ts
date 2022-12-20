import { IDetailQueryResult, ISpatialFeatureViewModel } from '@coscrad/api-interfaces';

/**
 * Our `SpatialFeature` view models are a sub-type of GeoJSON. While this technically
 * satisfies the `Geo JSON` standard, as a matter of user experience, we remove
 * superfluous (base view model \ detail query result) props `tags` and `actions`.
 */
export const toGeoJSON = (
    nonStandardModel: IDetailQueryResult<ISpatialFeatureViewModel>
): Omit<IDetailQueryResult<ISpatialFeatureViewModel>, 'actions' | 'tags'> => {
    const cloned = JSON.parse(
        JSON.stringify(nonStandardModel)
    ) as IDetailQueryResult<ISpatialFeatureViewModel>;

    /**
     * Note that we shouldn't hit the case that one of these props is not defined
     * due to our static type safety. However, it's still good to be defensive here.
     */
    if ('actions' in cloned) delete cloned['actions'];

    if ('tags' in cloned) delete cloned['tags'];

    return cloned;
};
