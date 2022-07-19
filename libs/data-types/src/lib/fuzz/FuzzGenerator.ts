import { CoscradDataSchema } from '../types/CoscradDataSchema';
import generateInvalidValuesForProperty, {
    generateValidValuesOfType,
} from './generateInvalidValuesForProperty';

export class FuzzGenerator {
    constructor(private readonly schema: CoscradDataSchema) {}

    generateInvalidValues() {
        return generateInvalidValuesForProperty(this.schema);
    }

    generateValidValues() {
        return generateValidValuesOfType(this.schema);
    }
}
