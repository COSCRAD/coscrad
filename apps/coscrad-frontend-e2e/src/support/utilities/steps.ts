export class Steps {
    private stepsMap: Map<string, () => void>;

    constructor() {
        this.stepsMap = new Map<string, () => void>();
    }

    addStep(stepName: string, step: () => void): this {
        if (this.stepsMap.has(stepName)) {
            throw new Error(`There is already a step with name: ${stepName}`);
        }

        this.stepsMap.set(stepName, step);

        return this;
    }

    apply(namesOfStepsToApply: string[]) {
        namesOfStepsToApply.forEach((stepName) => {
            if (!this.stepsMap.has(stepName)) {
                throw new Error(`Failed to apply unknown step: ${stepName}`);
            }

            const step = this.stepsMap.get(stepName);

            step();
        });
    }
}
