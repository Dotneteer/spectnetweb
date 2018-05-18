// This class provides information about the manipulation of the stack's contents
// event
export class StackContentManipulationEvent {
    // Address of the operation that modified the stack
    readonly OperationAddress: number;

    // The operation that modified the stack
    readonly Operation: string;

    // SP value before the operation
    readonly SpValue: number;

    // Value put on the stack
    readonly Content?: number;

    // CPU tact after the operation
    readonly Tacts: number;

    constructor(operationAddress: number, operation: string, spValue: number, 
        content: (number|null), tacts: number)
        {
            this.OperationAddress = operationAddress;
            this.Operation = operation;
            this.SpValue = spValue;
            this.Content = content;
            this.Tacts = tacts;
        }
}
