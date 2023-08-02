import { ReactNode, createContext, useState } from 'react';
import { FunctionalComponent } from '../../utils/types/functional-component';

export type TreeNodeId = string;

export type CategoryTreeUXState = {
    openBranches: TreeNodeId[];
};

export type UpdateCategoryTreeUXState = {
    categoryTreeUXState: CategoryTreeUXState;
    setCategoryTreeUXState: React.Dispatch<React.SetStateAction<CategoryTreeUXState>>;
};

export const CategoryTreeUXStateContext = createContext<UpdateCategoryTreeUXState>({
    categoryTreeUXState: { openBranches: [] },
    setCategoryTreeUXState: () => {},
});

type CategoryTreeUXStateProviderProps = {
    children: ReactNode;
};

export const CategoryTreeContextProvider: FunctionalComponent<CategoryTreeUXStateProviderProps> = ({
    children,
}: CategoryTreeUXStateProviderProps) => {
    const [categoryTreeUXState, setCategoryTreeUXState] = useState<CategoryTreeUXState>({
        openBranches: [],
    });

    const value = { categoryTreeUXState, setCategoryTreeUXState };

    return (
        <CategoryTreeUXStateContext.Provider value={value}>
            {children}
        </CategoryTreeUXStateContext.Provider>
    );
};
