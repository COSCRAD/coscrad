import { ICommandFormAndLabels } from '@coscrad/api-interfaces';

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
                {form.fields.map(({ description, name, type: fieldType }) => (
                    <div>
                        <label>
                            {/* label: {label} */}
                            name: {name} | {description} | I should be a field of type: {fieldType}
                            <input type="text" name={name}></input>
                        </label>
                    </div>
                ))}
                <div>
                    <input type="submit" value="Submit"></input>
                </div>
            </form>
        </div>
    );
};
