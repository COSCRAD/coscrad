import { CoscradPropertyTypeDefinition } from '../types';
import generateInvalidValuesForProperty, {
    generateValidValuesOfType,
} from './generateInvalidValuesForProperty';

export class FuzzGenerator {
    constructor(private readonly schema: CoscradPropertyTypeDefinition) {}

    generateInvalidValues() {
        return generateInvalidValuesForProperty(this.schema);
    }

    generateValidValues() {
        return generateValidValuesOfType(this.schema);
    }
}
