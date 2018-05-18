import { IFrameBoundDevice } from './IFrameBoundDevice';
import {} from './IZ80Cpu';
import { Z80Cpu } from '../cpu/Z80Cpu';

// This interface represents a Spectrum virtual machine
export interface ISpectrumVm extends IFrameBoundDevice {
    // The Z80 CPU of the machine
    readonly Cpu: Z80Cpu;
}

