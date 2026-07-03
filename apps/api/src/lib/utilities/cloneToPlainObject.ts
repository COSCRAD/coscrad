export default <T extends object>(instance: T) =>
    JSON.parse(
        JSON.stringify(instance, (_key, value) => {
            if (value instanceof Map) {
                return {
                    dataType: 'map',
                    value: Array.from(value.entries()),
                };
            }

            return value;
        }),
        (_key, value) => {
            const test = value as { dataType?: string; value: [string, unknown][] };

            if (test?.dataType === 'map') {
                const asRecord = {};

                test.value.forEach(([mapKey, mapValue]) => {
                    asRecord[mapKey] = mapValue;
                });

                return asRecord;
            }

            return value;
        }
    );
