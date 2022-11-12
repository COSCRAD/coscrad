import { RootState } from '../..';
import { CATEGORY_TREE } from './constants';

export const selectCategoryTree = (state: RootState) => state[CATEGORY_TREE];
