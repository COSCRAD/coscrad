export type CategoryTreeNodeDepth = number;

export type CategoryTreeUXContextType = {
    categoryTreeNodeDepth: CategoryTreeNodeDepth;
    setCategoryTreeNodeDepth: (categoryTreeNodeDepth: CategoryTreeNodeDepth) => void;
};
