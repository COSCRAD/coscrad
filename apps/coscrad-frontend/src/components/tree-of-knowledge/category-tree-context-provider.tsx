import { createContext } from 'react';

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
    setCategoryTreeUXState: () => {
        throw new Error(
            `You must provide a state update method for the context when building a CategoryTreeUxStateContext Provider`
        );
    },
});
