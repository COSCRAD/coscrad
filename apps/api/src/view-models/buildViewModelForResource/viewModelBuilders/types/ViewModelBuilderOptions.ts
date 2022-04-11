export type ViewModelBuilderOptions = {
    shouldReturnUnpublishedEntities: boolean;
};

export const getDefaultViewModelBuilderOptions = (): ViewModelBuilderOptions => ({
    shouldReturnUnpublishedEntities: false,
});
