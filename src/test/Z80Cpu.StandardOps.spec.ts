import { Z80TestMachine, RunMode } from "../test/Z80TestMachine";

describe('Z80 CPU Basic tests', () => {

    it('NOP works as expected', () => {
        // --- Arrange
        const m = new Z80TestMachine(RunMode.OneInstruction);
        m.InitCode([
            0x00, // NOP
        ]);

        // --- Act
        m.Run();

        // --- Assert
        const regs = m.Cpu.Registers;

        m.ShouldKeepRegisters();
        m.ShouldKeepMemory();

        expect(regs.PC).toBe(0x0001);
        expect(m.Cpu.Tacts).toBe(4);
    });
}); 
