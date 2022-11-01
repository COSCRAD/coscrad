import { RootState } from '../../../..';

export const selectLoadablePhotographs = (state: RootState) => {
    const result = state.photographs;

    return result;
};
