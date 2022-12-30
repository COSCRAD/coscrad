export const Ack = Symbol('command succeeded');

export type Ack = typeof Ack;

export type CommandResult = Ack | null;
