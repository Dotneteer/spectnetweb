import { ISpectrumBoundDevice } from "./ISpectrumBoundDevice";

// This interface represents the Spectrum's memory device
export interface IMemoryDevice extends ISpectrumBoundDevice {
    // Reads the memory at the specified address
    Read(addr: number, supressContention?: boolean): number;

    // Sets the memory value at the specified address
    Write(addr: number, value: number, supressContention?: boolean): void;

    // Emulates memory contention
    ContentionWait(addr: number): void;

    // Gets the buffer that holds memory data
    CloneMemory(): number[];

    // Fills up the contents of the ROM pointed by 
    // SelectRom from the specified buffer
    CopyRom(buffer: number[]): void;

    // Selects the ROM with the specified index
    SelectRom(romIndex: number): void;

    // Retrieves the index of the selected ROM
    GetSelectedRomIndex(): number;

    // Pages in the selected bank into the specified slot
    PageIn(slot: number, bank: number, bank16Mode?: boolean);

    // Gets the bank paged in to the specified slot
    GetSelectedBankIndex(slot: number, bank16Mode?: boolean): number;

    // Indicates of shadow screen should be used
    UsesShadowScreen: boolean;

    // Indicates special mode: special RAM paging
    readonly IsInAllRamMode: boolean;

    // Indicates if the device is in 8K mode
    readonly IsIn8KMode: boolean;

    // Gets the data for the specfied ROM page
    GetRomBuffer(romIndex: number): number[];

    // Gets the data for the specfied RAM bank
    GetRamBank(bankIndex: number, bank16Mode?: boolean): number[];

    // Gets the location of the address
    GetAddressLocation(addr: number): { IsInRom: boolean, Index: number, Address: number } 

    // Checks if the RAM bank with the specified index is paged in
    IsRamBankPagedIn(index: number): { IsPagedIn: boolean; BaseAddress: number };
}