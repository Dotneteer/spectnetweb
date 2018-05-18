import { IDevice } from './IDevice';
import { ISpectrumVm } from './ISpectrumVm';

// Represents a device that is attached to a hosting Spectrum
// virtual machine
export interface ISpectrumBoundDevice extends IDevice {
    // The virtual machine that hosts the device
    readonly HostVm: ISpectrumVm

    // Signs that the device has been attached to the Spectrum virtual machine
    OnAttachedToVm(hostvm: ISpectrumVm);
}