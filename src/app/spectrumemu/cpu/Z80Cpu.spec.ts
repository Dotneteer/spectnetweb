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

    it('SetInterruptMode() works as expected', () => {
        var z80 = this.z80 as IZ80Cpu;
        var z80Test = this.z80 as IZ80CpuTestSupport;
        z80.Reset();

        z80Test.SetInterruptMode(2);
        
        expect(z80.InterruptMode).toBe(2);
    })

    it('SetIffValues() works as expected', () => {
        var z80 = this.z80 as IZ80Cpu;
        var z80Test = this.z80 as IZ80CpuTestSupport;
        z80.Reset();

        z80Test.SetIffValues(false);
        expect(z80.IFF1).toBeFalsy();
        expect(z80.IFF2).toBeFalsy();

        z80Test.SetIffValues(true);
        expect(z80.IFF1).toBeTruthy();
        expect(z80.IFF2).toBeTruthy();
    })

    it('BlockInterrupt() works as expected', () => {
        var z80 = this.z80 as IZ80Cpu;
        var z80Test = this.z80 as IZ80CpuTestSupport;
        z80.Reset();

        z80Test.BlockInterrupt();
        
        expect(z80.IsInterruptBlocked).toBeTruthy();
    })

    it('Delay() works as expected', () => {
        var z80 = this.z80 as IZ80Cpu;
        z80.Reset();

        z80.Delay(123);
        
        expect(z80.Tacts).toBe(123);
    })

    it('ClockP1() works as expected', () => {
        var z80 = this.z80 as IZ80Cpu;
        var z80Test = this.z80 as IZ80CpuTestSupport;
        z80.Reset();

        z80Test.ClockP1();
        
        expect(z80.Tacts).toBe(1);
    })

    it('ClockP2() works as expected', () => {
        var z80 = this.z80 as IZ80Cpu;
        var z80Test = this.z80 as IZ80CpuTestSupport;
        z80.Reset();

        z80Test.ClockP2();
        
        expect(z80.Tacts).toBe(2);
    })

    it('ClockP3() works as expected', () => {
        var z80 = this.z80 as IZ80Cpu;
        var z80Test = this.z80 as IZ80CpuTestSupport;
        z80.Reset();

        z80Test.ClockP3();
        
        expect(z80.Tacts).toBe(3);
    })

    it('ClockP4() works as expected', () => {
        var z80 = this.z80 as IZ80Cpu;
        var z80Test = this.z80 as IZ80CpuTestSupport;
        z80.Reset();

        z80Test.ClockP4();
        
        expect(z80.Tacts).toBe(4);
    })

    it('ClockP5() works as expected', () => {
        var z80 = this.z80 as IZ80Cpu;
        var z80Test = this.z80 as IZ80CpuTestSupport;
        z80.Reset();

        z80Test.ClockP5();
        
        expect(z80.Tacts).toBe(5);
    })

    it('ClockP6() works as expected', () => {
        var z80 = this.z80 as IZ80Cpu;
        var z80Test = this.z80 as IZ80CpuTestSupport;
        z80.Reset();

        z80Test.ClockP6();
        expect(z80.Tacts).toBe(6);
    })

    it('ClockP7() works as expected', () => {
        var z80 = this.z80 as IZ80Cpu;
        var z80Test = this.z80 as IZ80CpuTestSupport;
        z80.Reset();

        z80Test.ClockP7();
        
        expect(z80.Tacts).toBe(7);
    })


})