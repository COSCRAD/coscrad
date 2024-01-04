import { HasId } from './has-id.interface';
import { IMultilingualText } from './resources/common';

export interface IBaseViewModel extends HasId {
    type: string;

    name: IMultilingualText;
}

export interface IBaseResourceViewModel extends IBaseViewModel {
    contributions: string[];
}
