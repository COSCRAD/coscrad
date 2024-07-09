import { HasId } from './has-id.interface';
import { IMultilingualText } from './resources/common';

export interface ContributorWithId {
    id: string;
    fullName: string;
}

export interface IBaseViewModel extends HasId {
    name: IMultilingualText;
}

export interface IBaseResourceViewModel extends IBaseViewModel {
    contributions: ContributorWithId[];
}
