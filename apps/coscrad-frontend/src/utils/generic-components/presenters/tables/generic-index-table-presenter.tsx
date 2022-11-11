import { IBaseViewModel } from '@coscrad/api-interfaces';
import './generic-index-table-presenter.css';

export type CellRenderers = {
    propertyKey: string;
    renderer: 
}

export type HeadingLabel<T extends IBaseViewModel> = {
    propertyKey: keyof T;
    headingLabel: string;
};

export interface GenericIndexTablePresenterProps<T extends IBaseViewModel> {
    headingLabels: HeadingLabel<T>[];
    tableData: T[];
}

export const GenericIndexTablePresenter = <T extends IBaseViewModel>({
    headingLabels,
    tableData,
}: GenericIndexTablePresenterProps<T>) => {
    return (
        <div>
            <table>
                <thead>
                    <tr>
                        {headingLabels.map(({ headingLabel }) => (
                            <th>{headingLabel}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {tableData.map((row) => (
                        <tr>
                            {headingLabels.map(({ propertyKey }) => (
                                // We never use numbers or symbols for view model keys
                                <td>{row[propertyKey as string]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
