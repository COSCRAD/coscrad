import { ClassDataTypeMetadata } from '@coscrad/data-types';

export type IndexProps = {
    schema: ClassDataTypeMetadata;
    data: Record<string, unknown>[];
};

export default ({ data, schema }: IndexProps): JSX.Element => {
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
                    {data.map((viewData) => {
                        return (
                            <tr>
                                {Object.entries(schema).map(([key, _]) => (
                                    <td>{(viewData as any)[key]}</td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
