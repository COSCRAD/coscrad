import {
    CategorizableCompositeIdentifier,
    CategorizableType,
    IBaseViewModel,
    ICategorizableDetailQueryResult,
    ICategorizableIndexQueryResult,
} from '@coscrad/api-interfaces';
import { isNull, isNullOrUndefined } from '@coscrad/validation-constraints';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../app/hooks';
import { RootState } from '../../store';
import { ILoadable } from '../../store/slices/interfaces/loadable.interface';
import { fetchFreshState } from '../../store/slices/utils/fetch-fresh-state';

// Hack alert- we need a mapping layer to give us the plurals for our redux slice names
type PluralCategorizableType = `${
    | Exclude<CategorizableType, typeof CategorizableType.transcribedAudio>
    | 'transcribedAudioItem'}s`;

export type ViewModelIndexSnapshot = Pick<RootState, PluralCategorizableType>;

export type ViewModelDetailSnapshot = {
    [K in keyof ViewModelIndexSnapshot]: ILoadable<ViewModelIndexSnapshot[K]['data']['entities']>;
};

export const getCategorizableTypeForSliceKey = (
    key: keyof ViewModelIndexSnapshot
): CategorizableType =>
    Object.values(CategorizableType).find((categorizableType) => key.includes(categorizableType));

export const useLoadableCategorizables = (
    compositeIdentifiers: CategorizableCompositeIdentifier[]
): ViewModelDetailSnapshot => {
    const uniqueCategorizableTypes = [...new Set(compositeIdentifiers.map(({ type }) => type))];

    const idMap = compositeIdentifiers.reduce(
        (acc, { type: categorizableType, id }) =>
            acc.set(
                categorizableType,
                acc.has(categorizableType) ? [...acc.get(categorizableType), id] : [id]
            ),
        new Map<CategorizableType, string[]>()
    );

    const loadableViewModels = useSelector((rootState) =>
        Object.entries(rootState).reduce(
            (
                acc: ViewModelIndexSnapshot,
                [key, loadableModels]: [
                    keyof ViewModelIndexSnapshot,
                    ICategorizableIndexQueryResult<IBaseViewModel>
                ]
            ) => {
                const categorizableType = getCategorizableTypeForSliceKey(
                    key as keyof ViewModelIndexSnapshot
                );

                return uniqueCategorizableTypes.includes(categorizableType)
                    ? {
                          ...acc,
                          [key]: loadableModels,
                      }
                    : acc;
            },
            {} as ViewModelIndexSnapshot // This will only be true once the process is complete
        )
    );

    const dispatch = useAppDispatch();

    // Dispatch fetch thunk if the Categorizable of this type is not yet loaded
    return Object.entries(loadableViewModels).reduce(
        (acc: ViewModelDetailSnapshot, [key, { isLoading, errorInfo, data }]) => {
            if (isNull(data) && !isLoading && isNull(errorInfo)) {
                const categorizableType = getCategorizableTypeForSliceKey(
                    key as keyof ViewModelIndexSnapshot
                );

                if (isNullOrUndefined(categorizableType)) {
                    throw new Error(`Failed to link slice name: ${key} to a Categorizable Type`);
                }

                fetchFreshState(dispatch, categorizableType);

                return {
                    ...acc,
                    [key]: {
                        isLoading,
                        errorInfo,
                        data,
                    },
                };
            }

            return {
                ...acc,
                [key]: {
                    isLoading: false,
                    errorInfo: null,
                    // @ts-expect-error fix me
                    data: data?.entities.filter(
                        ({ id }: ICategorizableDetailQueryResult<IBaseViewModel>) =>
                            idMap
                                .get(
                                    getCategorizableTypeForSliceKey(
                                        key as keyof ViewModelIndexSnapshot
                                    )
                                )
                                .includes(id)
                    ),
                },
            };
        },
        {} as ViewModelDetailSnapshot
    );
};
