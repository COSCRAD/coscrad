import { ICommandFormAndLabels } from '@coscrad/api-interfaces';
import { buildCommandFieldComponent } from './CommandFields/buildCommandFieldComponent';

/**
 * Eventually, we may want to inject a different presentational component
 * depending on a config (e.g. for React native instead of react web.
 */
export const ComamndForm = ({
    type,
    label,
    description,
    form,
}: ICommandFormAndLabels): JSX.Element => {
    return (
        <div>
            <h1>Command: [{label}]</h1>
            <h2>{description}</h2>
            <form onSubmit={() => console.log(`Submitted command of type: ${type}`)}>
                {form.fields.map(
                    ({ description, name, type: fieldType, label: fieldLabel, options }) => (
                        <div>
                            {buildCommandFieldComponent(fieldType)({
                                description,
                                name,
                                type: fieldType,
                                label: fieldLabel,
                                options,
                            })}
                        </div>
                    )
                )}
                <div>
                    <input type="submit" value="Submit"></input>
                </div>
            </form>
        </div>
    );
};
