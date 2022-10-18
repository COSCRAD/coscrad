// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { FluxStandardAction as GenericFSA } from '@coscrad/api-interfaces';
import { ICommand } from './command.interface';

export interface FluxStandardAction<T extends ICommand = {}> extends GenericFSA<T, string> {}
