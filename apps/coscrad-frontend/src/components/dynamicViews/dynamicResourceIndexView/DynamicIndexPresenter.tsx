import {
    ICommandFormAndLabels,
    ICoscradModelSchema,
    IDetailQueryResult,
} from '@coscrad/api-interfaces';
import { Link } from 'react-router-dom';
import { CommandPanel } from '../commands';

export type IndexProps = {
    schema: ICoscradModelSchema;
    data: IDetailQueryResult[];
    actions: ICommandFormAndLabels[];
};

type HasCoscradDataType = {
    coscradDataType: string;
};

const isSimpleCoscradPropertyTypeDefinition = (input: unknown): input is HasCoscradDataType => {
    const coscradDataType = (input as HasCoscradDataType)?.coscradDataType;

    if (coscradDataType === null || typeof coscradDataType === 'undefined') return false;

    return true;
};

/**
 * TODO This should take in a `CoscradDataType` and return a formatter that maps
 * data of said type to a readable string (presentation). JSON.stringify is
 * being used as a catch-all. This logic should exist in a separate lib.
 */
const getFormatterForDataType = (_dataType: string) => (data: unknown) => JSON.stringify(data);

export const DynamicIndexPresenter = ({ data, schema, actions }: IndexProps): JSX.Element => {
    if (!Array.isArray(data))
        return (
            <div>
                Error: resource index data must be an array. Received: ${JSON.stringify(data)}
            </div>
        );

    return (
        <div>
            <table>
                <thead>
                    <tr>
                        {Object.entries(schema).map(([key, _]) => (
                            <th>{key}</th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {data.map(({ data: viewData, actions }) => {
                        return (
                            <tr key={viewData.id}>
                                {Object.entries(schema).map(([key, dataSchema]) => (
                                    <td>
                                        <Link
                                            to="/ResourceDetail"
                                            state={{
                                                schema,
                                                data: viewData,
                                                actions,
                                            }}
                                        >
                                            {getFormatterForDataType(
                                                isSimpleCoscradPropertyTypeDefinition(dataSchema)
                                                    ? dataSchema.coscradDataType
                                                    : // TODO remove this hack
                                                      'COMPLEX'
                                            )((viewData as any)[key])}
                                        </Link>
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <div>
                <CommandPanel actions={actions}></CommandPanel>
            </div>
        </div>
    );
};
