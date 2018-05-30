import { Z80Cpu } from './Z80Cpu'
import { IZ80Cpu } from '../abstraction/IZ80Cpu';
import { IZ80CpuTestSupport } from '../abstraction/IZ80CpuTestSupport';
describe('Z80 CPU Basic tests', () => {

    var z80: Z80Cpu

    beforeEach(() => {
        this.z80 = new Z80Cpu();
    });

    afterEach(() => {
        // TODO: tear down each test
    });

    it('Reset() should clear Tacts', () => {
        var z80 = this.z80 as IZ80Cpu;

        z80.Reset();

        expect(z80.Tacts).toBe(0);
    });

    it('SetTacts() works as expected', () => {
        var z80 = this.z80 as IZ80Cpu;
        var z80Test = this.z80 as IZ80CpuTestSupport;
        z80.Reset();

        z80Test.SetTacts(12345)
        
        expect(z80.Tacts).toBe(12345);
    });

    it('SetInterruptmode() works as expected', () => {
        var z80 = this.z80 as IZ80Cpu;
        var z80Test = this.z80 as IZ80CpuTestSupport;
        z80.Reset();

        z80Test.SetInterruptMode(2);
        
        expect(z80.InterruptMode).toBe(2);
    })


})