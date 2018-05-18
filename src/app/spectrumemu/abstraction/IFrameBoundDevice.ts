import { ILiteEvent } from './ILightEvent';

// This device is bound to a rendering frame of the Spectrum virtual machine
export interface IFrameBoundDevice {
    // #of frames rendered
    readonly FrameCount: number;

    // Overflow from the previous frame, given in #of tacts 
    Overflow: number;

    // Allow the device to react to the start of a new frame
    OnNewFrame(): void;

    // Allow the device to react to the completion of a frame
    OnFrameCompleted(): void;

    // Allow external entities respond to frame completion
    FrameCompleted: ILiteEvent<void>;
}
