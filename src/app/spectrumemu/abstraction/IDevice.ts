// Represents an abstract device
export interface IDevice {
    // Resets the device
    Reset(): void;

    // Gets the current state of the device
    GetDeviceState(): any;

    // Restores the state of the device from the specified object
    RestoreDeviceState(state: any): void;
}
