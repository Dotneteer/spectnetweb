import { ISpectrumBoundDevice } from "./ISpectrumBoundDevice";

// This interface represents a port device that can be attached to a 
// Spectrum virtual machine
export interface IPortDevice extends ISpectrumBoundDevice {
    // Reads the port with the specified address
    ReadPort(addr: number): number;
    
    // Sends a byte to the port with the specified address
    WritePort(addr: number, data: number): void;

    // Emulates I/O contention
    ContentionWait(addr: number): void;
}
