export default <T extends object>(instance: T) => JSON.parse(JSON.stringify(instance));
