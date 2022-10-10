import { SimpleCoscradPropertyTypeDefinition } from '../types/SimpleCoscradPropertyTypeDefinition';
import generateInvalidValuesForProperty, {
    generateValidValuesOfType,
} from './generateInvalidValuesForProperty';

export class FuzzGenerator {
    constructor(private readonly schema: SimpleCoscradPropertyTypeDefinition) {}

    generateInvalidValues() {
        return generateInvalidValuesForProperty(this.schema);
    }

    generateValidValues() {
        return generateValidValuesOfType(this.schema);
    }
}
