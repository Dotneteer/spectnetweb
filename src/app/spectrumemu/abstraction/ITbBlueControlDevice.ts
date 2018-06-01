import { IDevice } from "./IDevice";

// This interface represents a TBBlue control device that can be
// used to set up TBBLUE registers and their values
export interface ITbBlueControlDevice extends IDevice {
    // Sets the register index for the next SetRegisterValue operation
    SetRegisterIndex(index: number);

    // Sets the value of the register specified by the latest
    // SetRegisterIndex call
    SetRegisterValue(value: number);
}
