import { ISpectrumBoundDevice } from "./ISpectrumBoundDevice";

// This interface represents the Spectrum's memory device
export interface IMemoryDevice extends ISpectrumBoundDevice {
    // Reads the memory at the specified address
    Read(addr: number, supressContention?: boolean): number;

    // Sets the memory value at the specified address
    Write(addr: number, value: number, supressContention?: boolean): void;

    // Emulates memory contention
    ContentionWait(addr: number): void;
}