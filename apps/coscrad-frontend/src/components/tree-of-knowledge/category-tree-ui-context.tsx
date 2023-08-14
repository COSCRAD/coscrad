import { createContext, useState } from 'react';
import {
    CategoryTreeNodeDepth,
    CategoryTreeUXContextType,
} from './types/category-tree-ui-context-type';

export const CategoryTreeUXContext = createContext<CategoryTreeUXContextType | null>(null);

export const CategoryTreeUXProvider = ({ children }): JSX.Element => {
    const [categoryTreeNodeDepth, setCategoryTreeNodeDepth] = useState<CategoryTreeNodeDepth>(1);

    return (
        <CategoryTreeUXContext.Provider value={{ categoryTreeNodeDepth, setCategoryTreeNodeDepth }}>
            {children}
        </CategoryTreeUXContext.Provider>
    );
};
