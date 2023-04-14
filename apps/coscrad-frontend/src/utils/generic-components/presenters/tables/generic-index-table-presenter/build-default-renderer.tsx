import { IBaseViewModel } from '@coscrad/api-interfaces';

export const buildDefaultRenderer =
    <T extends IBaseViewModel>(propertyKey: keyof T) =>
    (input: T) =>
        <>{(JSON.stringify(input[propertyKey]) || '').replace(/"/g, '')}</>;
