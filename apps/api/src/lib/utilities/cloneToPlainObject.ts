// TODO We need a return type here!
export default <T extends object>(instance: T) => JSON.parse(JSON.stringify(instance));
