import { IBaseViewModel } from '@coscrad/api-interfaces';

// We may want to extend `HasId` instead
export const GenericTableRowPresenter = <T extends IBaseViewModel>(
    tableDataRow: T
): JSX.Element => (
    <tr data-testid={tableDataRow.id}>
        {Object.entries(tableDataRow).map(([key, value]) => {
            return (
                <td key={key}>
                    {key}: {JSON.stringify(value)}
                </td>
            );
        })}
    </tr>
);
