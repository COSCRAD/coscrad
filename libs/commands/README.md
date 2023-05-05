# @coscrad/commands

## Background

### Command Based Systems

We have adopted a command based approach to state change management. In conjunction with the DDD practice of defining "aggregate boundaries", this approach allows for fine-grained control over the possible state changes a user can create. You can think of these as forming a finite state machine with each aggregate root (root domain model) having its own command flow. This approach is well known as part of the CQRS-ES pattern.

A command based approach to state management differs from the CRUD approach to state management in several key ways.

-   The user cannot drive arbitrary state changes
-   Workflows can be designed based on the actual workflow of domain experts
-   State changes (successful commands) can be stored as an event history
-   From the event history, you can reproduce the state of any aggregate (model) at any historical point in time
-   You can event source a new view model at a previous point in time!
-   No magic is required to obtain these historical states
-   Discipline is required as these events must be immutable or all the benefits go out the window
-   Versioning requires more care

It is common to create a separate query database whose state is event sourced from the domain events. Typically, successful commands trigger publication of these events asynchronously from the command (write) database. We are not presently going this far down the road of CQRS-ES, but because we are persisting an event history, this is a possible architectural migration in the future should we find the extra complexity is worth the benefits.

## About this Lib

This lib is loosely inpsired by the NestJS CQRS package.
We opted for a simplified approach as it is not clear that we will do full CQRS-ES and we were aiming for transparency and easy debugging.

## Usage

### Commands and Command Handlers

#### Commands

Commands are defined data classes. Note that you can use this library in conjuction with `@coscrad/data-types` to obtain schemas for command payloads (useful when building dynamic forms) and validation for these payload types (very important as the input is from the client).

Every command is identifiable by its command type. You specify a command's type when registering it with the `@Command(commandType)` decorator.

#### Command Handlers

A command handler must implement the `ICommandHandler` interface. I.e., it must have an method with the signature

```ts
async execute(
        command: ICommand,
        commandType: string,
): void;
```

You must link a command handler to the command that it handles by registering you command handler with the decorator `@CommandHandler(MyCommand)`, where `MyCommand` is a reference to the command's class (constructor);

Import the `CommandModule` into your Nest application. Inject an instance of the `CommandHandlerService` into a controller. Call `CommandHandlerService.execute(commandFSA)` to execute a command.

For an example, see any files with the form `<some-command>.command.ts` and `<some-command>.command-handler.ts` within the COSCRAD back-end (`api`).
