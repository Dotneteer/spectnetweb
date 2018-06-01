import { IZ80Cpu } from '../abstraction/IZ80Cpu';
import { IZ80CpuTestSupport } from '../abstraction/IZ80CpuTestSupport';
import { Registers } from './Registers';
import { Z80StateFlags } from '../cpu/Z80StateFlags';
import { IMemoryDevice } from '../abstraction/IMemoryDevice';
import { IPortDevice } from '../abstraction/IPortDevice';
import { IStackDebugSupport } from '../abstraction/IStackDebugSupport';
import { IBranchDebugSupport } from '../abstraction/IBranchDebugSupport';
import { ILiteEvent, LiteEvent } from '../abstraction/ILightEvent';
import { AddressArgs } from './AddressArgs';
import { AddressAndDataArgs } from './AddressAndDataArgs';
import { Z80InstructionExecutionArgs } from './Z80InstructionExecutionArgs';
import { OpPrefixMode } from './OpPrefixMode';
import { OpIndexMode } from './OpIndexMode';
import { MemoryStatusArray } from './MemoryStatusArray';
import { ITbBlueControlDevice } from '../abstraction/ITbBlueControlDevice';
import { FlagsSetMask } from './FlagsSetMask';


// ========================================================================
// Instruction process function jump tables

const standardOperations: ((Z80Cpu) => void)[] = [
    null,      LdBCNN,    LdBCiA,    IncBC,     IncB,      DecB,      LdBN,      Rlca,    // 00..07
    ExAF,      AddHLBC,   LdABCi,    DecBC,     IncC,      DecC,      LdCN,      Rrca,    // 08..0F
    Djnz,      LdDENN,    LdDEiA,    IncDE,     IncD,      DecD,      LdDN,      Rla,     // 10..17
    JrE,       AddHLDE,   LdADEi,    DecDE,     IncE,      DecE,      LdEN,      Rra,     // 18..1F
    JrNZ,      LdHLNN,    LdNNiHL,   IncHL,     IncH,      DecH,      LdHN,      Daa,     // 20..27
    JrZ,       AddHLHL,   LdHLNNi,   DecHL,     IncL,      DecL,      LdLN,      Cpl,     // 28..2F
    JrNC,      LdSPNN,    LdNNA,     IncSP,     IncHLi,    DecHLi,    LdHLiN,    Scf,     // 30..37
    JrC,       AddHLSP,   LdNNiA,    DecSP,     IncA,      DecA,      LdAN,      Ccf,     // 38..3F

    null,      LdB_C,     LdB_D,     LdB_E,     LdB_H,     LdB_L,     LdB_HLi,   LdB_A,   // 40..47
    LdC_B,     null,      LdC_D,     LdC_E,     LdC_H,     LdC_L,     LdC_HLi,   LdC_A,   // 48..4F
    LdD_B,     LdD_C,     null,      LdD_E,     LdD_H,     LdD_L,     LdD_HLi,   LdD_A,   // 50..57
    LdE_B,     LdE_C,     LdE_D,     null,      LdE_H,     LdE_L,     LdE_HLi,   LdE_A,   // 58..5F
    LdH_B,     LdH_C,     LdH_D,     LdH_E,     null,      LdH_L,     LdH_HLi,   LdH_A,   // 60..67
    LdL_B,     LdL_C,     LdL_D,     LdL_E,     LdL_H,     null,      LdL_HLi,   LdL_A,   // 68..6F
    LdHLi_B,   LdHLi_C,   LdHLi_D,   LdHLi_E,   LdHLi_H,   LdHLi_L,   Halt,      LdHLi_A, // 70..77
    LdA_B,     LdA_C,     LdA_D,     LdA_E,     LdA_H,     LdA_L,     LdA_HLi,   null,    // 78..7F

    AddA_B,    AddA_C,    AddA_D,    AddA_E,    AddA_H,    AddA_L,    AddA_HLi,  AddA_A,  // 80..87
    AdcA_B,    AdcA_C,    AdcA_D,    AdcA_E,    AdcA_H,    AdcA_L,    AdcA_HLi,  AdcA_A,  // 88..8F
    SubB,      SubC,      SubD,      SubE,      SubH,      SubL,      SubHLi,    SubA,    // 90..97
    SbcB,      SbcC,      SbcD,      SbcE,      SbcH,      SbcL,      SbcHLi,    SbcA,    // 98..9F
    AndB,      AndC,      AndD,      AndE,      AndH,      AndL,      AndHLi,    AndA,    // A0..A7
    XorB,      XorC,      XorD,      XorE,      XorH,      XorL,      XorHLi,    XorA,    // A8..AF
    OrB,       OrC,       OrD,       OrE,       OrH,       OrL,       OrHLi,     OrA,     // B0..B7
    CpB,       CpC,       CpD,       CpE,       CpH,       CpL,       CpHLi,     CpA,     // B8..BF

    RetNZ,     PopBC,     JpNZ_NN,   JpNN,      CallNZ,    PushBC,    AluAN,     Rst00,   // C0..C7
    RetZ,      Ret,       JpZ_NN,    null,      CallZ,     CallNN,    AluAN,     Rst08,   // C8..CF
    RetNC,     PopDE,     JpNC_NN,   OutNA,     CallNC,    PushDE,    AluAN,     Rst10,   // D0..D7
    RetC,      Exx,       JpC_NN,    InAN,      CallC,     null,      AluAN,     Rst18,   // D8..DF
    RetPO,     PopHL,     JpPO_NN,   ExSPiHL,   CallPO,    PushHL,    AluAN,     Rst20,   // E0..E7
    RetPE,     JpHL,      JpPE_NN,   ExDEHL,    CallPE,    null,      AluAN,     Rst28,   // E8..EF
    RetP,      PopAF,     JpP_NN,    Di,        CallP,     PushAF,    AluAN,     Rst30,   // F0..F7
    RetM,      LdSPHL,    JpM_NN,    Ei,        CallM,     null,      AluAN,     Rst38    // F8..FF
];

const extendedOperations: ((Z80Cpu) => void)[] = [
    null,      null,      null,      null,      null,      null,      null,      null,    // 00..07
    null,      null,      null,      null,      null,      null,      null,      null,    // 08..0F
    null,      null,      null,      null,      null,      null,      null,      null,    // 10..17
    null,      null,      null,      null,      null,      null,      null,      null,    // 18..1F
    null,      null,      null,      Swapnib,   MirrA,     null,      MirrDE,    TestN,   // 20..27
    null,      null,      null,      null,      null,      null,      null,      null,    // 28..2F
    Mul,       AddHL_A,   AddDE_A,   AddBC_A,   AddHLNN,   AddDENN,   AddBCNN,   null,    // 30..37
    null,      null,      null,      null,      null,      null,      null,      null,    // 38..3F

    InB_C,     OutC_B,    SbcHL_QQ,  LdNNi_QQ,  Neg,       Retn,      ImN,       LdXR_A,  // 40..47
    InC_C,     OutC_C,    AdcHL_QQ,  LdQQ_NNi,  Neg,       Reti,      ImN,       LdXR_A,  // 48..4F
    InD_C,     OutC_D,    SbcHL_QQ,  LdNNi_QQ,  Neg,       Retn,      ImN,       LdA_XR,  // 50..57
    InE_C,     OutC_E,    AdcHL_QQ,  LdQQ_NNi,  Neg,       Retn,      ImN,       LdA_XR,  // 58..5F
    InH_C,     OutC_H,    SbcHL_QQ,  LdNNi_QQ,  Neg,       Retn,      ImN,       Rrd,     // 60..67
    InL_C,     OutC_L,    AdcHL_QQ,  LdQQ_NNi,  Neg,       Retn,      ImN,       Rld,     // 60..6F
    InF_C,     OutC_0,    SbcHL_QQ,  LdNNi_QQ,  Neg,       Retn,      ImN,       null,    // 70..77
    InA_C,     OutC_A,    AdcHL_QQ,  LdSP_NNi,  Neg,       Retn,      ImN,       null,    // 78..7F

    null,      null,      null,      null,      null,      null,      null,      null,    // 80..87
    null,      null,      PushNN,    null,      null,      null,      null,      null,    // 88..8F
    Outinb,    Nextreg,   NextregA,  Pixeldn,   Pixelad,   Setae,     null,      null,    // 90..97
    null,      null,      null,      null,      null,      null,      null,      null,    // 98..9F
    Ldi,       Cpi,       Ini,       Outi,      Ldix,      null,      null,      null,    // A0..A7
    Ldd,       Cpd,       Ind,       Outd,      Lddx,      null,      null,      null,    // A8..AF
    Ldir,      Cpir,      Inir,      Otir,      Ldirx,     null,      Ldirscale, Ldpirx,  // B0..B7
    Lddr,      Cpdr,      Indr,      Otdr,      Lddrx,     null,      null,      null,    // B0..BF

    null,      null,      null,      null,      null,      null,      null,      null,    // C0..C7
    null,      null,      null,      null,      null,      null,      null,      null,    // C8..CF
    null,      null,      null,      null,      null,      null,      null,      null,    // D0..D7
    null,      null,      null,      null,      null,      null,      null,      null,    // D8..DF
    null,      null,      null,      null,      null,      null,      null,      null,    // E0..E7
    null,      null,      null,      null,      null,      null,      null,      null,    // E8..EF
    null,      null,      null,      null,      null,      null,      null,      null,    // F0..F7
    null,      null,      null,      null,      null,      null,      null,      null     // F8..FF
];

const bitOperations: ((Z80Cpu) => void)[] = [
    RlcB,      RlcC,      RlcD,      RlcE,      RlcH,      RlcL,      RlcHLi,    RlcA,    // 00..07
    RrcB,      RrcC,      RrcD,      RrcE,      RrcH,      RrcL,      RrcHLi,    RrcA,    // 08..0F
    RlB,       RlC,       RlD,       RlE,       RlH,       RlL,       RlHLi,     RlA,     // 10..17
    RrB,       RrC,       RrD,       RrE,       RrH,       RrL,       RrHLi,     RrA,     // 18..1F
    SlaB,      SlaC,      SlaD,      SlaE,      SlaH,      SlaL,      SlaHLi,    SlaA,    // 20..27
    SraB,      SraC,      SraD,      SraE,      SraH,      SraL,      SraHLi,    SraA,    // 28..2F
    SllB,      SllC,      SllD,      SllE,      SllH,      SllL,      SllHLi,    SllA,    // 30..37
    SrlB,      SrlC,      SrlD,      SrlE,      SrlH,      SrlL,      SrlHLi,    SrlA,    // 38..3F

    BitN_Q,    BitN_Q,    BitN_Q,    BitN_Q,    BitN_Q,    BitN_Q,    BinN_HLi,  BitN_Q,   // 40..47
    BitN_Q,    BitN_Q,    BitN_Q,    BitN_Q,    BitN_Q,    BitN_Q,    BinN_HLi,  BitN_Q,   // 48..4F
    BitN_Q,    BitN_Q,    BitN_Q,    BitN_Q,    BitN_Q,    BitN_Q,    BinN_HLi,  BitN_Q,   // 50..57
    BitN_Q,    BitN_Q,    BitN_Q,    BitN_Q,    BitN_Q,    BitN_Q,    BinN_HLi,  BitN_Q,   // 58..5F
    BitN_Q,    BitN_Q,    BitN_Q,    BitN_Q,    BitN_Q,    BitN_Q,    BinN_HLi,  BitN_Q,   // 60..67
    BitN_Q,    BitN_Q,    BitN_Q,    BitN_Q,    BitN_Q,    BitN_Q,    BinN_HLi,  BitN_Q,   // 68..6F
    BitN_Q,    BitN_Q,    BitN_Q,    BitN_Q,    BitN_Q,    BitN_Q,    BinN_HLi,  BitN_Q,   // 70..77
    BitN_Q,    BitN_Q,    BitN_Q,    BitN_Q,    BitN_Q,    BitN_Q,    BinN_HLi,  BitN_Q,   // 78..7F

    ResN_Q,    ResN_Q,    ResN_Q,    ResN_Q,    ResN_Q,    ResN_Q,    ResN_HLi,  ResN_Q,   // 80..87
    ResN_Q,    ResN_Q,    ResN_Q,    ResN_Q,    ResN_Q,    ResN_Q,    ResN_HLi,  ResN_Q,   // 88..8F
    ResN_Q,    ResN_Q,    ResN_Q,    ResN_Q,    ResN_Q,    ResN_Q,    ResN_HLi,  ResN_Q,   // 90..97
    ResN_Q,    ResN_Q,    ResN_Q,    ResN_Q,    ResN_Q,    ResN_Q,    ResN_HLi,  ResN_Q,   // 98..9F
    ResN_Q,    ResN_Q,    ResN_Q,    ResN_Q,    ResN_Q,    ResN_Q,    ResN_HLi,  ResN_Q,   // A0..A7
    ResN_Q,    ResN_Q,    ResN_Q,    ResN_Q,    ResN_Q,    ResN_Q,    ResN_HLi,  ResN_Q,   // A8..AF
    ResN_Q,    ResN_Q,    ResN_Q,    ResN_Q,    ResN_Q,    ResN_Q,    ResN_HLi,  ResN_Q,   // B0..B7
    ResN_Q,    ResN_Q,    ResN_Q,    ResN_Q,    ResN_Q,    ResN_Q,    ResN_HLi,  ResN_Q,   // B8..BF

    SetN_Q,    SetN_Q,    SetN_Q,    SetN_Q,    SetN_Q,    SetN_Q,    SetN_HLi,  SetN_Q,   // C0..C7
    SetN_Q,    SetN_Q,    SetN_Q,    SetN_Q,    SetN_Q,    SetN_Q,    SetN_HLi,  SetN_Q,   // C8..CF
    SetN_Q,    SetN_Q,    SetN_Q,    SetN_Q,    SetN_Q,    SetN_Q,    SetN_HLi,  SetN_Q,   // D0..D7
    SetN_Q,    SetN_Q,    SetN_Q,    SetN_Q,    SetN_Q,    SetN_Q,    SetN_HLi,  SetN_Q,   // D8..DF
    SetN_Q,    SetN_Q,    SetN_Q,    SetN_Q,    SetN_Q,    SetN_Q,    SetN_HLi,  SetN_Q,   // E0..E7
    SetN_Q,    SetN_Q,    SetN_Q,    SetN_Q,    SetN_Q,    SetN_Q,    SetN_HLi,  SetN_Q,   // E8..EF
    SetN_Q,    SetN_Q,    SetN_Q,    SetN_Q,    SetN_Q,    SetN_Q,    SetN_HLi,  SetN_Q,   // F0..F7
    SetN_Q,    SetN_Q,    SetN_Q,    SetN_Q,    SetN_Q,    SetN_Q,    SetN_HLi,  SetN_Q    // F8..FF
];

const indexedOperations: ((Z80Cpu) => void)[] = [
    null,      LdBCNN,    LdBCiA,    IncBC,     IncB,      DecB,      LdBN,      Rlca,     // 00..07
    ExAF,      AddIX_QQ,  LdABCi,    DecBC,     IncC,      DecC,      LdCN,      Rrca,     // 08..0F
    Djnz,      LdDENN,    LdDEiA,    IncDE,     IncD,      DecD,      LdDN,      Rla,      // 10..17
    JrE,       AddIX_QQ,  LdADEi,    DecDE,     IncE,      DecE,      LdEN,      Rra,      // 18..1F
    JrNZ,      LdIX_NN,   LdNNi_IX,  IncIX,     IncXH,     DecXH,     LdXH_N,    Daa,      // 20..27
    JrZ,       AddIX_QQ,  LdIX_NNi,  DecIX,     IncXL,     DecXL,     LdXL_N,    Cpl,      // 28..2F
    JrNC,      LdSPNN,    LdNNA,     IncSP,     IncIXi,    DecIXi,    LdIXi_NN,  Scf,      // 30..37
    JrC,       AddIX_QQ,  LdNNiA,    DecSP,     IncA,      DecA,      LdAN,      Ccf,      // 38..3F

    null,      LdB_C,     LdB_D,     LdB_E,     LdQ_XH,    LdQ_XL,    LdQ_IXi,   LdB_A,    // 40..47
    LdC_B,     null,      LdC_D,     LdC_E,     LdQ_XH,    LdQ_XL,    LdQ_IXi,   LdC_A,    // 48..4F
    LdD_B,     LdD_C,     null,      LdD_E,     LdQ_XH,    LdQ_XL,    LdQ_IXi,   LdD_A,    // 50..57
    LdE_B,     LdE_C,     LdE_D,     null,      LdQ_XH,    LdQ_XL,    LdQ_IXi,   LdE_A,    // 58..5F
    LdXH_Q,    LdXH_Q,    LdXH_Q,    LdXH_Q,    null,      LdXH_XL,   LdQ_IXi,   LdXH_Q,   // 60..67
    LdXL_Q,    LdXL_Q,    LdXL_Q,    LdXL_Q,    LdXL_XH,   null,      LdQ_IXi,   LdXL_Q,   // 68..6F
    LdIXi_Q,   LdIXi_Q,   LdIXi_Q,   LdIXi_Q,   LdIXi_Q,   LdIXi_Q,   Halt,      LdIXi_Q,  // 70..77
    LdA_B,     LdA_C,     LdA_D,     LdA_E,     LdQ_XH,    LdQ_XL,    LdQ_IXi,   null,     // 78..7F

    AddA_B,    AddA_C,    AddA_D,    AddA_E,    AluA_XH,   AluA_XL,   AluA_IXi,  AddA_A,   // 80..87
    AdcA_B,    AdcA_C,    AdcA_D,    AdcA_E,    AluA_XH,   AluA_XL,   AluA_IXi,  AdcA_A,   // 88..8F
    SubB,      SubC,      SubD,      SubE,      AluA_XH,   AluA_XL,   AluA_IXi,  SubA,     // 90..97
    SbcB,      SbcC,      SbcD,      SbcE,      AluA_XH,   AluA_XL,   AluA_IXi,  SbcA,     // 98..9F
    AndB,      AndC,      AndD,      AndE,      AluA_XH,   AluA_XL,   AluA_IXi,  AndA,     // A0..A7
    XorB,      XorC,      XorD,      XorE,      AluA_XH,   AluA_XL,   AluA_IXi,  XorA,     // A8..AF
    OrB,       OrC,       OrD,       OrE,       AluA_XH,   AluA_XL,   AluA_IXi,  OrA,      // B0..B7
    CpB,       CpC,       CpD,       CpE,       AluA_XH,   AluA_XL,   AluA_IXi,  CpA,      // B8..BF

    RetNZ,     PopBC,     JpNZ_NN,   JpNN,      CallNZ,    PushBC,    AluAN,     Rst00,    // C0..C7
    RetZ,      Ret,       JpZ_NN,    null,      CallZ,     CallNN,    AluAN,     Rst08,    // C8..CF
    RetNC,     PopDE,     JpNC_NN,   OutNA,     CallNC,    PushDE,    AluAN,     Rst10,    // D0..D7
    RetC,      Exx,       JpC_NN,    InAN,      CallC,     null,      AluAN,     Rst18,    // D8..DF
    RetPO,     PopIX,     JpPO_NN,   ExSPiIX,   CallPO,    PushIX,    AluAN,     Rst20,    // E0..E7
    RetPE,     JpIXi,     JpPE_NN,   ExDEHL,    CallPE,    null,      AluAN,     Rst28,    // E8..EF
    RetP,      PopAF,     JpP_NN,    Di,        CallP,     PushAF,    AluAN,     Rst30,    // F0..F7
    RetM,      LdSPIX,    JpM_NN,    Ei,        CallM,     null,      AluAN,     Rst38     // F8..FF
];

const indexedBitOperations: ((Z80Cpu) => void)[] = [
    XrlcQ,     XrlcQ,     XrlcQ,    XrlcQ,      XrlcQ,     XrlcQ,     Xrlc,      XrlcQ,    // 00..07
    XrrcQ,     XrrcQ,     XrrcQ,    XrrcQ,      XrrcQ,     XrrcQ,     Xrrc,      XrrcQ,    // 08..0F
    XrlQ,      XrlQ,      XrlQ,     XrlQ,       XrlQ,      XrlQ,      Xrl,       XrlQ,     // 10..17
    XrrQ,      XrrQ,      XrrQ,     XrrQ,       XrrQ,      XrrQ,      Xrr,       XrrQ,     // 18..1F
    XslaQ,     XslaQ,     XslaQ,    XslaQ,      XslaQ,     XslaQ,     Xsla,      XslaQ,    // 20..27
    XsraQ,     XsraQ,     XsraQ,    XsraQ,      XsraQ,     XsraQ,     Xsra,      XsraQ,    // 28..2F
    XsllQ,     XsllQ,     XsllQ,    XsllQ,      XsllQ,     XsllQ,     Xsll,      XsllQ,    // 30..37
    XsrlQ,     XsrlQ,     XsrlQ,    XsrlQ,      XsrlQ,     XsrlQ,     Xsrl,      XsrlQ,    // 38..3F

    XbitN,    XbitN,    XbitN,    XbitN,    XbitN,    XbitN,    XbitN,    XbitN,    // 40..47
    XbitN,    XbitN,    XbitN,    XbitN,    XbitN,    XbitN,    XbitN,    XbitN,    // 48..4F
    XbitN,    XbitN,    XbitN,    XbitN,    XbitN,    XbitN,    XbitN,    XbitN,    // 50..57
    XbitN,    XbitN,    XbitN,    XbitN,    XbitN,    XbitN,    XbitN,    XbitN,    // 58..5F
    XbitN,    XbitN,    XbitN,    XbitN,    XbitN,    XbitN,    XbitN,    XbitN,    // 60..67
    XbitN,    XbitN,    XbitN,    XbitN,    XbitN,    XbitN,    XbitN,    XbitN,    // 68..6F
    XbitN,    XbitN,    XbitN,    XbitN,    XbitN,    XbitN,    XbitN,    XbitN,    // 70..77
    XbitN,    XbitN,    XbitN,    XbitN,    XbitN,    XbitN,    XbitN,    XbitN,    // 78..7F

    Xres,     Xres,     Xres,     Xres,     Xres,     Xres,     Xres,     Xres,    // 80..87
    Xres,     Xres,     Xres,     Xres,     Xres,     Xres,     Xres,     Xres,    // 88..8F
    Xres,     Xres,     Xres,     Xres,     Xres,     Xres,     Xres,     Xres,    // 90..97
    Xres,     Xres,     Xres,     Xres,     Xres,     Xres,     Xres,     Xres,    // 98..9F
    Xres,     Xres,     Xres,     Xres,     Xres,     Xres,     Xres,     Xres,    // A0..A7
    Xres,     Xres,     Xres,     Xres,     Xres,     Xres,     Xres,     Xres,    // A8..AF
    Xres,     Xres,     Xres,     Xres,     Xres,     Xres,     Xres,     Xres,    // B0..B7
    Xres,     Xres,     Xres,     Xres,     Xres,     Xres,     Xres,     Xres,    // B8..BF

    Xset,     Xset,     Xset,     Xset,     Xset,     Xset,     Xset,     Xset,    // C0..C7
    Xset,     Xset,     Xset,     Xset,     Xset,     Xset,     Xset,     Xset,    // C8..CF
    Xset,     Xset,     Xset,     Xset,     Xset,     Xset,     Xset,     Xset,    // D0..D7
    Xset,     Xset,     Xset,     Xset,     Xset,     Xset,     Xset,     Xset,    // D8..DF
    Xset,     Xset,     Xset,     Xset,     Xset,     Xset,     Xset,     Xset,    // E0..E7
    Xset,     Xset,     Xset,     Xset,     Xset,     Xset,     Xset,     Xset,    // E8..EF
    Xset,     Xset,     Xset,     Xset,     Xset,     Xset,     Xset,     Xset,    // F0..F7
    Xset,     Xset,     Xset,     Xset,     Xset,     Xset,     Xset,     Xset     // F8..FF
];

// ========================================================================
// Helper tables for ALU operations

const aluAlgorithms: ((number, boolean) => void)[] = [
    AluADD,
    AluADC,
    AluSUB,
    AluSBC,
    AluAND,
    AluXOR,
    AluOR,
    AluCP
];

// Provides a table that contains the value of the F register after a 8-bit INC operation
var incOpFlags: number[];

// Provides a table that contains the value of the F register after a 8-bit INC operation
var decOpFlags: number[];

// Stores the accepted AF results of a DAA operation. The first 8 bits of
// the index is the value of A before the DAA operation; the ramining 3 bits
// are H, N, and C flags respectively.
// The upper 8 bits of the value represent A, the lower 8 bits are for F.
var daaResults: number[];

// Provides a table that contains the value of the F register after a 8-bit ADD/ADC operation.
var adcFlags: number[];

// Provides a table that contains the value of the F register after a 8-bit SUB/SBC operation.
var sbcFlags: number[];

// Provides a table that contains the value of the F register after an
// 8-bit ALU bitwise logic operation (according to the result).
var aluLogOpFlags: number[];

// Provides a table that contains the value of the F register after an
// 8-bit ALU RLC operation (according to the result).
var rlcFlags: number[];

// Provides a table that contains the result of rotate left operations.
var rolOpResults: number[];

// Provides a table that contains the value of the F register after an
// 8-bit ALU RRC operation (according to the result).
var rrcFlags: number[];

// Provides a table that contains the result of rotate right operations.
var rorOpResults: number[];

// Provides a table that contains the value of the F register after an
// 8-bit ALU RL operation with a previous Carry flag value of 1 (according to the result).
// This table supports the ALU SLA operation, too.
var rlCarry0Flags: number[];

// Provides a table that contains the value of the F register after an
// 8-bit ALU RL operation with a previous Carry flag value of 1 (according to the result).
var rlCarry1Flags: number[];

// Provides a table that contains the value of the F register after an
// 8-bit ALU RL operation with a previous Carry flag value of 1 (according to the result).
// This table supports the ALU SRA operation, too.
var rrCarry0Flags: number[];

// Provides a table that contains the value of the F register after an
// 8-bit ALU RL operation with a previous Carry flag value of 1 (according to the result).
var rrCarry1Flags: number[];

// Provides a table that contains the value of the F register after an
// 8-bit ALU SRA operation (according to the result).
var sraFlags: number[];

// ========================================================================
// Initialize the ALU helper tables

// --- 8 bit INC operation flags
incOpFlags = [];
for (var b = 0; b < 0x100; b++) {
    const oldVal = b;
    const newVal = oldVal + 1;
    incOpFlags[b] =
        // C is unaffected, we keep it false
        (newVal & FlagsSetMask.R3) |
        (newVal & FlagsSetMask.R5) |
        ((newVal & 0x80) != 0 ? FlagsSetMask.S : 0) |
        (newVal == 0 ? FlagsSetMask.Z : 0) |
        ((oldVal & 0x0F) == 0x0F ? FlagsSetMask.H : 0) |
        (oldVal == 0x7F ? FlagsSetMask.PV : 0);
        // N is false
}

// --- 8 bit DEC operation flags
decOpFlags = [];
for (var b = 0; b < 0x100; b++) {
    const oldVal = b;
    const newVal = oldVal - 1;
    decOpFlags[b] =
        // C is unaffected, we keep it false
        (newVal & FlagsSetMask.R3) |
        (newVal & FlagsSetMask.R5) |
        ((newVal & 0x80) != 0 ? FlagsSetMask.S : 0) |
        (newVal == 0 ? FlagsSetMask.Z : 0) |
        ((oldVal & 0x0F) == 0x00 ? FlagsSetMask.H : 0) |
        (oldVal == 0x80 ? FlagsSetMask.PV : 0) |
        FlagsSetMask.N;
}

// --- DAA flags table
daaResults = [];
for (var b = 0; b < 0x100; b++) {
    const hNibble = b >> 4;
    const lNibble = b & 0x0F;

    for (var H = 0; H <= 1; H++) {
        for (var N = 0; N <= 1; N++) {
            for (var C = 0; C <= 1; C++) {
                // --- Calculate DIFF and the new value of C Flag
                var diff = 0x00;
                var cAfter = 0;
                if (C == 0) {
                    if (hNibble >= 0 && hNibble <= 9 && lNibble >= 0 && lNibble <= 9) {
                        diff = H == 0 ? 0x00 : 0x06;
                    }
                    else if (hNibble >= 0 && hNibble <= 8 && lNibble >= 0x0A && lNibble <= 0xF) {
                        diff = 0x06;
                    }
                    else if (hNibble >= 0x0A && hNibble <= 0x0F && lNibble >= 0 && lNibble <= 9 && H == 0) {
                        diff = 0x60;
                        cAfter = 1;
                    }
                    else if (hNibble >= 9 && hNibble <= 0x0F && lNibble >= 0x0A && lNibble <= 0xF) {
                        diff = 0x66;
                        cAfter = 1;
                    }
                    else if (hNibble >= 0x0A && hNibble <= 0x0F && lNibble >= 0 && lNibble <= 9) {
                        if (H == 1) diff = 0x66;
                        cAfter = 1;
                    }
                }
                else {
                    // C == 1
                    cAfter = 1;
                    if (lNibble >= 0 && lNibble <= 9) {
                        diff = H == 0 ? 0x60 : 0x66;
                    }
                    else if (lNibble >= 0x0A && lNibble <= 0x0F) {
                        diff = 0x66;
                    }
                }

                // --- Calculate new value of H Flag
                var hAfter = 0;
                if (lNibble >= 0x0A && lNibble <= 0x0F && N == 0
                    || lNibble >= 0 && lNibble <= 5 && N == 1 && H == 1) {
                    hAfter = 1;
                }

                // --- Calculate new value of register A
                var A = (N == 0 ? b + diff : b - diff) & 0xFF;

                // --- Calculate other flags
                var aPar = 0;
                var val = A;
                for (var i = 0; i < 8; i++) {
                    aPar += val & 0x01;
                    val >>= 1;
                }

                // --- Calculate result
                var fAfter =
                    (A & FlagsSetMask.R3) |
                    (A & FlagsSetMask.R5) |
                    ((A & 0x80) != 0 ? FlagsSetMask.S : 0) |
                    (A == 0 ? FlagsSetMask.Z : 0) |
                    (aPar % 2 == 0 ? FlagsSetMask.PV : 0) |
                    (N == 1 ? FlagsSetMask.N : 0) |
                    (hAfter == 1 ? FlagsSetMask.H : 0) |
                    (cAfter == 1 ? FlagsSetMask.C : 0);

                    var result = (A << 8 | (fAfter & 0xFF)) &0xFFFF;
                            var fBefore = (H * 4 + N * 2 + C) & 0xFF;
                            var idx = (fBefore << 8) + b;
                daaResults[idx] = result;
            }
        }
    }
}

// --- ADD and ADC flags
adcFlags = [];
for (var C = 0; C < 2; C++) {
    for (var X = 0; X < 0x100; X++) {
        for (var Y = 0; Y < 0x100; Y++) {
            const res = (X + Y + C) & 0xFFFF;
            var flags = 0;
            if ((res & 0xFF) == 0) flags |= FlagsSetMask.Z;
            flags |= res & (FlagsSetMask.R3 | FlagsSetMask.R5 | FlagsSetMask.S);
            if (res >= 0x100) flags |= FlagsSetMask.C;
            if ((((X & 0x0F) + (Y & 0x0F) + C) & 0x10) != 0) flags |= FlagsSetMask.H;
            var ri = toSbyte(X) + toSbyte(Y) + C;
            if (ri >= 0x80 || ri <= -0x81) flags |= FlagsSetMask.PV;
            adcFlags[C * 0x10000 + X * 0x100 + Y] = flags & 0xFF;
        }
    }
}

// --- SUB and SBC flags
sbcFlags = [];
for (var C = 0; C < 2; C++) {
    for (var X = 0; X < 0x100; X++) {
        for (var Y = 0; Y < 0x100; Y++) {
            const res = X - Y - C;
            var flags = res & (FlagsSetMask.R3 | FlagsSetMask.R5 | FlagsSetMask.S);
            if ((res & 0xFF) == 0) flags |= FlagsSetMask.Z;
            if ((res & 0x10000) != 0) flags |= FlagsSetMask.C;
            var ri = toSbyte(X) - toSbyte(Y) - C;
            if (ri >= 0x80 || ri < -0x80) flags |= FlagsSetMask.PV;
            if ((((X & 0x0F) - (res & 0x0F) - C) & 0x10) != 0) flags |= FlagsSetMask.H;
            flags |= FlagsSetMask.N;
            sbcFlags[C * 0x10000 + X * 0x100 + Y] = flags &0xFF;
        }
    }
}

// --- ALU log operation (AND, XOR, OR) flags
aluLogOpFlags = [];
for (var b = 0; b < 0x100; b++) {
    const fl = b & (FlagsSetMask.R3 | FlagsSetMask.R5 | FlagsSetMask.S);
    var p = FlagsSetMask.PV;
    for (var i = 0x80; i != 0; i /= 2) {
        if ((b & i) != 0) p ^= FlagsSetMask.PV;
    }
    aluLogOpFlags[b] = (fl | p) &0xFF;
}
aluLogOpFlags[0] |= FlagsSetMask.Z;

// --- 8-bit RLC operation flags
rlcFlags = [];
for (var b = 0; b < 0x100; b++) {
    var rlcVal = b;
    rlcVal <<= 1;
    var cf = (rlcVal & 0x100) != 0 ? FlagsSetMask.C : 0;
    if (cf != 0) {
        rlcVal = (rlcVal | 0x01) & 0xFF;
    }
    var p = FlagsSetMask.PV;
    for (var i = 0x80; i != 0; i /= 2) {
        if ((rlcVal & i) != 0) p ^= FlagsSetMask.PV;
    }
    var flags = (rlcVal & (FlagsSetMask.S | FlagsSetMask.R5 | FlagsSetMask.R3) | p | cf) & 0xFF;
    if (rlcVal == 0) flags |= FlagsSetMask.Z;
    rlcFlags[b] = flags;
}

 // --- 8-bit RRC operation flags
rrcFlags = [];
for (var b = 0; b < 0x100; b++) {
    var rrcVal = b;
    var cf = (rrcVal & 0x01) != 0 ? FlagsSetMask.C : 0;
    rrcVal >>= 1;
    if (cf != 0) {
        rrcVal = (rrcVal | 0x80);
    }
    var p = FlagsSetMask.PV;
    for (var i = 0x80; i != 0; i /= 2) {
        if ((rrcVal & i) != 0) p ^= FlagsSetMask.PV;
    }
    var flags = (rrcVal & (FlagsSetMask.S | FlagsSetMask.R5 | FlagsSetMask.R3) | p | cf) & 0xFF;
    if (rrcVal == 0) flags |= FlagsSetMask.Z;
    rrcFlags[b] = flags;
}

// --- 8-bit RL operations with 0 Carry flag
rlCarry0Flags = [];
for (var b = 0; b < 0x100; b++) {
    var rlVal = b;
    rlVal <<= 1;
    var cf = (rlVal & 0x100) != 0 ? FlagsSetMask.C : 0;
    var p = FlagsSetMask.PV;
    for (var i = 0x80; i != 0; i /= 2) {
        if ((rlVal & i) != 0) p ^= FlagsSetMask.PV;
    }
    var flags = (rlVal & (FlagsSetMask.S | FlagsSetMask.R5 | FlagsSetMask.R3) | p | cf) & 0xFF;
    if ((rlVal & 0xFF) == 0) {
        flags |= FlagsSetMask.Z;
    }
    rlCarry0Flags[b] = flags;
}

// --- 8-bit RL operations with Carry flag set
rlCarry1Flags = [];
for (var b = 0; b < 0x100; b++) {
    var rlVal = b;
    rlVal <<= 1;
    rlVal++;
    var cf = (rlVal & 0x100) != 0 ? FlagsSetMask.C : 0;
    var p = FlagsSetMask.PV;
    for (var i = 0x80; i != 0; i /= 2) {
        if ((rlVal & i) != 0) p ^= FlagsSetMask.PV;
    }
    var flags = (rlVal & (FlagsSetMask.S | FlagsSetMask.R5 | FlagsSetMask.R3) | p | cf) & 0xFF;
    if ((rlVal & 0x1FF) == 0) {
        flags |= FlagsSetMask.Z;
    }
    rlCarry1Flags[b] = flags;
}

// --- 8-bit RR operations with 0 Carry flag
rrCarry0Flags = [];
for (var b = 0; b < 0x100; b++) {
    var rrVal = b;
    var cf = (rrVal & 0x01) != 0 ? FlagsSetMask.C : 0;
    rrVal >>= 1;
    var p = FlagsSetMask.PV;
    for (var i = 0x80; i != 0; i /= 2) {
        if ((rrVal & i) != 0) p ^= FlagsSetMask.PV;
    }
    var flags = (rrVal & (FlagsSetMask.S | FlagsSetMask.R5 | FlagsSetMask.R3) | p | cf) & 0xFF;
    if (rrVal == 0) flags |= FlagsSetMask.Z;
    rrCarry0Flags[b] = flags;
}

// --- 8-bit RR operations with Carry flag set
rrCarry1Flags = [];
for (var b = 0; b < 0x100; b++) {
    var rrVal = b;
    var cf = (rrVal & 0x01) != 0 ? FlagsSetMask.C : 0;
    rrVal >>= 1;
    rrVal += 0x80;
    var p = FlagsSetMask.PV;
    for (var i = 0x80; i != 0; i /= 2) {
        if ((rrVal & i) != 0) p ^= FlagsSetMask.PV;
    }
    var flags = (rrVal & (FlagsSetMask.S | FlagsSetMask.R5 | FlagsSetMask.R3) | p | cf) &0xFF;
    if (rrVal == 0) flags |= FlagsSetMask.Z;
    rrCarry1Flags[b] = flags;
}

// --- 8-bit SRA operation flags
sraFlags = [];
for (var b = 0; b < 0x100; b++) {
    var sraVal = b;
    var cf = (sraVal & 0x01) != 0 ? FlagsSetMask.C : 0;
    sraVal = (sraVal >> 1) + (sraVal & 0x80);
    var p = FlagsSetMask.PV;
    for (var i = 0x80; i != 0; i /= 2) {
        if ((sraVal & i) != 0) p ^= FlagsSetMask.PV;
    }
    var flags = (sraVal & (FlagsSetMask.S | FlagsSetMask.R5 | FlagsSetMask.R3) | p | cf) & 0xFF;
    if ((sraVal & 0xFF) == 0) flags |= FlagsSetMask.Z;
    sraFlags[b] = flags;
}

// --- Initialize rotate operation tables
rolOpResults = [];
rorOpResults = [];

for (var b = 0; b < 0x100; b++) {
    rolOpResults[b] = ((b << 1) + (b >> 7)) & 0xFF;
    rorOpResults[b] = ((b >> 1) + (b << 7)) & 0xFF;
}

// Converts an unsigned byte to a signed byte
function toSbyte(x: number) {
    x &= 0xFF;
    return x >= 128 ? x - 256 : x;
}

// ========================================================================
// This class represents the Z80 CPU
export class Z80Cpu implements IZ80Cpu, IZ80CpuTestSupport {

    private _opCode: number;
    private _instructionBytes: number[] = [];
    private _lastPC: number;

    // Gets the current tact of the device -- the clock cycles since
    // the device was reset
    Tacts: number;

    // The registers of the Z80 CPU
    Registers: Registers;
 
    // CPU signals and HW flags
    StateFlags: Z80StateFlags;

    // Specifies the contention mode that affects the CPU.
    // False: ULA contention mode;
    // True: Gate array contention mode;
    UseGateArrayContention: boolean;

    // Interrupt Enable Flip-Flop #1
    IFF1: boolean;

    // Interrupt Enable Flip-Flop #2
    IFF2: boolean;

    // The current Interrupt mode
    InterruptMode: number;

    // The interrupt is blocked
    IsInterruptBlocked: boolean;

    // Is currently in opcode execution?
    IsInOpExecution: boolean;

    // Gets the memory device associated with the CPU
    MemoryDevice: IMemoryDevice

    // Gets the device that handles Z80 CPU I/O operations
    PortDevice: IPortDevice;

    // Gets the object that supports debugging the stack
    StackDebugSupport: IStackDebugSupport;

    // Gets the object that supports debugging jump instructions
    BranchDebugSupport: IBranchDebugSupport;

    // This flag indicates if the CPU entered into a maskable
    // interrupt method as a result of an INT signal
    MaskableInterruptModeEntered: boolean;

    // This flag signs if the Z80 extended instruction set (Spectrum Next)
    // is allowed, or NOP instructions should be executed instead of
    // these extended operations.
    AllowExtendedInstructionSet: boolean;

    // Gets the current execution flow status
    ExecutionFlowStatus: MemoryStatusArray

    // Gets the current memory read status
    MemoryReadStatus: MemoryStatusArray;

    // Gets the current memory write status
    MemoryWriteStatus: MemoryStatusArray;

    // This event is raised just before a maskable interrupt is about to execute
    InterruptExecuting: ILiteEvent<void>;

    // This event is raised just before a non-maskable interrupt is about to execute
    NmiExecuting: LiteEvent<void>

    // This event is raised just before the memory is being read
    MemoryReading: LiteEvent<AddressArgs>;

    // This event is raised right after the memory has been read
    MemoryRead: LiteEvent<AddressAndDataArgs>;
    
    // This event is raised just before the memory is being written
    MemoryWriting: LiteEvent<AddressAndDataArgs>;
    
    // This event is raised just after the memory has been written
    MemoryWritten: LiteEvent<AddressAndDataArgs>;
    
    // This event is raised just before a port is being read
    PortReading: LiteEvent<AddressArgs>;
    
    // This event is raised right after a port has been read
    PortRead: LiteEvent<AddressArgs>;
    
    // This event is raised just before a port is being written
    PortWriting: LiteEvent<AddressAndDataArgs>;
    
    // This event is raised just after a port has been written
    PortWritten: LiteEvent<AddressAndDataArgs>;

    // This event is raised just before a Z80 operation is being executed
    OperationExecuting: LiteEvent<Z80InstructionExecutionArgs>;

    // This event is raised just after a Z80 operation has been executed
    OperationExecuted: LiteEvent<Z80InstructionExecutionArgs>;

    // The current Operation Prefix Mode
    PrefixMode: OpPrefixMode;

    // The current Operation Index Mode
    IndexMode: OpIndexMode;

    // =======================================================================
    // Lifecycle

    constructor(memoryDevice?: IMemoryDevice, portDevice?: IPortDevice, 
        allowExtendedInstructionSet?: boolean, private _tbBlueDevice?: ITbBlueControlDevice) {
        this.Registers = new Registers();
        this.InterruptExecuting = new LiteEvent<void>();
        this.NmiExecuting = new LiteEvent<void>();
        this.MemoryReading = new LiteEvent<AddressArgs>();
        this.MemoryRead = new LiteEvent<AddressAndDataArgs>();
        this.MemoryWriting = new LiteEvent<AddressAndDataArgs>();
        this.MemoryWritten = new LiteEvent<AddressAndDataArgs>();
        this.PortReading = new LiteEvent<AddressArgs>();
        this.PortRead = new LiteEvent<AddressAndDataArgs>();
        this.PortWriting = new LiteEvent<AddressAndDataArgs>();
        this.PortWritten = new LiteEvent<AddressAndDataArgs>();
        this.OperationExecuting = new LiteEvent<Z80InstructionExecutionArgs>();
        this.OperationExecuted = new LiteEvent<Z80InstructionExecutionArgs>();
        this._instructionBytes = [];
        this._lastPC = 0;
        this.MemoryDevice = memoryDevice;
        this.PortDevice = portDevice;
        this.AllowExtendedInstructionSet = allowExtendedInstructionSet == null 
            ? false : allowExtendedInstructionSet;
        this.ExecutionFlowStatus = new MemoryStatusArray();
        this.MemoryReadStatus = new MemoryStatusArray();
        this.MemoryWriteStatus = new MemoryStatusArray();
        this.ExecuteReset();
    }

    // Applies the RESET signal
    Reset() {
        this.ExecuteReset();
    }
    
    // ========================================================================
    // Clock handling methods
    // Increments the internal clock with the specified delay ticks
    Delay(ticks: number) {
        this.Tacts += ticks;
    }
    
    // Increments the internal clock counter with 1
    ClockP1() {
        this.Tacts += 1;
    }

    // Increments the internal clock counter with 2
    ClockP2() {
        this.Tacts += 2;
    }

    // Increments the internal clock counter with 3
    ClockP3() {
        this.Tacts += 3;
    }

    // Increments the internal clock counter with 4
    ClockP4() {
        this.Tacts += 4;
    }

    // Increments the internal clock counter with 5
    ClockP5() {
        this.Tacts += 5;
    }

    // Increments the internal clock counter with 6
    ClockP6() {
        this.Tacts += 6;
    }

    // Increments the internal clock counter with 7
    ClockP7() {
        this.Tacts += 7;
    }

    // ========================================================================
    // Main execution cycle methods

    // Executes a CPU cycle
    ExecuteCpuCycle() {
        // --- If any of the RST, INT or NMI signals has been processed,
        // --- Execution flow in now on the corresponding way
        // --- Nothing more to do in this execution cycle
        if (this.ProcessCpuSignals()) return;

        // --- Get operation code and refresh the memory
        this.MaskableInterruptModeEntered = false;
        var opCode = this.ReadCodeMemory();
        this.ClockP3();
        this.Registers.PC++;
        this.RefreshMemory();
        if (this.PrefixMode == OpPrefixMode.None) {
            // -- The CPU is about to execute a standard operation
            switch (opCode) {
                case 0xDD:
                    // --- An IX index prefix received
                    // --- Disable the interrupt unless the full operation code is received
                    this.IndexMode = OpIndexMode.IX;
                    this.IsInOpExecution = this.IsInterruptBlocked = true;
                    return;

                case 0xFD:
                    // --- An IY index prefix received
                    // --- Disable the interrupt unless the full operation code is received
                    this.IndexMode = OpIndexMode.IY;
                    this.IsInOpExecution = this.IsInterruptBlocked = true;
                    return;

                case 0xCB:
                    // --- A bit operation prefix received
                    // --- Disable the interrupt unless the full operation code is received
                    this.PrefixMode = OpPrefixMode.Bit;
                    this.IsInOpExecution = this.IsInterruptBlocked = true;
                    return;

                case 0xED:
                    // --- An extended operation prefix received
                    // --- Disable the interrupt unless the full operation code is received
                    this.PrefixMode = OpPrefixMode.Extended;
                    this.IsInOpExecution = this.IsInterruptBlocked = true;
                    return;

                default:
                    // --- Normal (8-bit) operation code received
                    this.IsInterruptBlocked = false;
                    this._opCode = opCode;
                    (this.OperationExecuting as LiteEvent<Z80InstructionExecutionArgs>)
                        .trigger(new Z80InstructionExecutionArgs(
                            this._lastPC, this._instructionBytes, opCode, null));
                    this.ProcessStandardOrIndexedOperations();
                    (this.OperationExecuted as LiteEvent<Z80InstructionExecutionArgs>)
                        .trigger(new Z80InstructionExecutionArgs(
                            this._lastPC, this._instructionBytes, opCode, this.Registers.PC));
                    this.PrefixMode = OpPrefixMode.None;
                    this.IndexMode = OpIndexMode.None;
                    this.IsInOpExecution = false;
                    this._instructionBytes = [];
                    this._lastPC = this.Registers.PC;
                    return;
            }
        }

        if (this.PrefixMode == OpPrefixMode.Bit) {
            // --- The CPU is already in BIT operations (0xCB) prefix mode
            this.IsInterruptBlocked = false;
            this._opCode = opCode;
            (this.OperationExecuting as LiteEvent<Z80InstructionExecutionArgs>)
                .trigger(new Z80InstructionExecutionArgs(
                    this._lastPC, this._instructionBytes, opCode, null));
            this.ProcessCBPrefixedOperations();
            (this.OperationExecuted as LiteEvent<Z80InstructionExecutionArgs>)
                .trigger(new Z80InstructionExecutionArgs(
                    this._lastPC, this._instructionBytes, opCode, this.Registers.PC));
            this.IndexMode = OpIndexMode.None;
            this.PrefixMode = OpPrefixMode.None;
            this.IsInOpExecution = false;
            this._instructionBytes = [];
            this._lastPC = this.Registers.PC;
            return;
        }

        if (this.PrefixMode == OpPrefixMode.Extended) {
            // --- The CPU is already in Extended operations (0xED) prefix mode
            this.IsInterruptBlocked = false;
            this._opCode = opCode;
            (this.OperationExecuting as LiteEvent<Z80InstructionExecutionArgs>)
                .trigger(new Z80InstructionExecutionArgs(
                        this._lastPC, this._instructionBytes, opCode, null));
            this.ProcessEDOperations();
            (this.OperationExecuted as LiteEvent<Z80InstructionExecutionArgs>)
                .trigger(new Z80InstructionExecutionArgs(
                    this._lastPC, this._instructionBytes, opCode, this.Registers.PC));
            this.IndexMode = OpIndexMode.None;
            this.PrefixMode = OpPrefixMode.None;
            this.IsInOpExecution = false;
            this._instructionBytes = [];
            this._lastPC = this.Registers.PC;
        }
    }
  
    // Checks if the next instruction to be executed is a call instruction or not
    GetCallInstructionLength(): number {
        return 0;
    }
    
    // ========================================================================
    // Memory and port device operations

    // Read the memory at the specified address
    ReadMemory(addr: number): number {
        (this.MemoryReading as LiteEvent<AddressArgs>).trigger(new AddressArgs(addr));
        this.MemoryReadStatus.Touch(addr);
        var data = this.MemoryDevice.Read(addr);
        (this.MemoryRead as LiteEvent<AddressAndDataArgs>).trigger(new AddressAndDataArgs(addr, data));
        return data;
    }

    // Read the memory at the PC address
    ReadCodeMemory(): number {
        this.ExecutionFlowStatus.Touch(this.Registers.PC);
        var data = this.MemoryDevice.Read(this.Registers.PC);
        this._instructionBytes.push(data);
        return data;
    }

    // Set the memory value at the specified address
    WriteMemory(addr: number, value: number) {
        (this.MemoryWriting as LiteEvent<AddressAndDataArgs>).trigger(new AddressAndDataArgs(addr, value));
        this.MemoryWriteStatus.Touch(addr);
        this.MemoryDevice.Write(addr, value);
        (this.MemoryWritten as LiteEvent<AddressAndDataArgs>).trigger(new AddressAndDataArgs(addr, value));
    }

    // Read the port with the specified address
    ReadPort(addr: number): number {
        (this.PortReading as LiteEvent<AddressArgs>).trigger(new AddressArgs(addr));
        var data = this.PortDevice.ReadPort(addr);
        (this.PortRead as LiteEvent<AddressAndDataArgs>).trigger(new AddressAndDataArgs(addr, data));
        return data;
    }

    // Write data to the port with the specified address
    WritePort(addr: number, data: number) {
        (this.PortWriting as LiteEvent<AddressAndDataArgs>).trigger(new AddressAndDataArgs(addr, data));
        this.PortDevice.WritePort(addr, data);
        (this.PortWritten as LiteEvent<AddressAndDataArgs>).trigger(new AddressAndDataArgs(addr, data));
    }

    // ========================================================================
    // CPU signal processing methods

    // Processes the CPU signals coming from peripheral devices
    // of the computer
    // Returns true, if a signal has been processed; otherwise, false
    private ProcessCpuSignals(): boolean {
        if (this.StateFlags == Z80StateFlags.None) return false;

        if ((this.StateFlags & Z80StateFlags.Int) != 0 && !this.IsInterruptBlocked && this.IFF1) {
            (this.InterruptExecuting as LiteEvent<void>).trigger();
                this.ExecuteInterrupt();
                return true;
        }

        if ((this.StateFlags & Z80StateFlags.Halted) != 0) {
            // --- The HALT instruction suspends CPU operation until a 
            // --- subsequent interrupt or reset is received. While in the
            // --- HALT state, the processor executes NOPs to maintain
            // --- memory refresh logic.
            this.ClockP3();
            this.RefreshMemory();
            return true;
        }

        if ((this.StateFlags & Z80StateFlags.Reset) != 0) {
            this.ExecuteReset();
            return true;
        }

        if ((this.StateFlags & Z80StateFlags.Nmi) != 0) {
            (this.NmiExecuting as LiteEvent<void>).trigger();
            this.ExecuteNmi();
            return true;
        }

        return false;
    }

    // Executes an INT
    private ExecuteInterrupt() {
        if ((this.StateFlags & Z80StateFlags.Halted) != 0)
        {
            // --- We emulate stepping over the HALT instruction
            this.Registers.PC++;
            this.StateFlags &= Z80StateFlags.InvHalted;
        }
        this.IFF1 = false;
        this.IFF2 = false;
        this.Registers.SP--;
        this.ClockP1();
        this.WriteMemory(this.Registers.SP, this.Registers.PC >> 8);
        this.ClockP3();
        this.Registers.SP--;
        this.WriteMemory(this.Registers.SP, this.Registers.PC & 0xFF);
        this.ClockP3();

        switch (this.InterruptMode)
        {
            // --- Interrupt Mode 0:
            // --- The interrupting device can place any instruction on
            // --- the data bus and the CPU executes it. Consequently, the
            // --- interrupting device provides the next instruction to be 
            // --- executed.
            case 0:
                
            // --- Interrupt Mode 1:
            // --- The CPU responds to an interrupt by executing a restart
            // --- at address 0038h.As a result, the response is identical to 
            // --- that of a nonmaskable interrupt except that the call 
            // --- location is 0038h instead of 0066h.
            case 1:
                // --- In this implementation, we do cannot emulate a device
                // --- that places instruction on the data bus, so we'll handle
                // --- IM 0 and IM 1 the same way
                this.Registers.WZ = 0x0038;
                this.ClockP5();
                break;

            // --- Interrupt Mode 2:
            // --- The programmer maintains a table of 16-bit starting addresses 
            // --- for every interrupt service routine. This table can be 
            // --- located anywhere in memory. When an interrupt is accepted, 
            // --- a 16-bit pointer must be formed to obtain the required interrupt
            // --- service routine starting address from the table. The upper 
            // --- eight bits of this pointer is formed from the contents of the I
            // --- register.The I register must be loaded with the applicable value
            // --- by the programmer. A CPU reset clears the I register so that it 
            // --- is initialized to 0. The lower eight bits of the pointer must be
            // --- supplied by the interrupting device. Only seven bits are required
            // --- from the interrupting device, because the least-significant bit 
            // --- must be a 0.
            // --- This process is required, because the pointer must receive two
            // --- adjacent bytes to form a complete 16-bit service routine starting 
            // --- address; addresses must always start in even locations.
            default:
                // --- Getting the lower byte from device (assume 0)
                this.ClockP2();
                var adr = (this.Registers.IR & 0xFF00) | 0xFF;
                this.ClockP5();
                var l = this.ReadMemory(adr);
                this.ClockP3();
                var h = this.ReadMemory(++adr);
                this.ClockP3();
                this.Registers.WZ = (h * 0x100 + l);
                this.ClockP6();
                break;
        }
        this.Registers.PC = this.Registers.WZ;
        this.MaskableInterruptModeEntered = true;
    }

    // Takes care of refreching the dynamic memory
    // The Z80 CPU contains a memory refresh counter, enabling dynamic 
    // memories to be used with the same ease as static memories. Seven 
    // bits of this 8-bit register are automatically incremented after 
    // each instruction fetch. The eighth bit remains as programmed, 
    // resulting from an "LD R, A" instruction. The data in the refresh
    // counter is sent out on the lower portion of the address bus along 
    // with a refresh control signal while the CPU is decoding and 
    // executing the fetched instruction. This mode of refresh is 
    // transparent to the programmer and does not slow the CPU operation.
    // </remarks>
    private RefreshMemory() {
        this.Registers.R = ((this.Registers.R + 1) & 0x7F) | (this.Registers.R & 0x80);
        this.ClockP1();
    }

    // Executes a hard reset
    private ExecuteReset() {
        this._instructionBytes = [];
        this._lastPC = 0;
        this.IFF1 = false;
        this.IFF2 = false;
        this.InterruptMode = 0;
        this.IsInterruptBlocked = false;
        this.StateFlags = Z80StateFlags.None;
        this.PrefixMode = OpPrefixMode.None;
        this.IndexMode = OpIndexMode.None;
        this.Registers.PC = 0x0000;
        this.Registers.IR = 0x0000;
        this.IsInOpExecution = false;
        this.Tacts = 0;
    }

    // Executes an NMI
    private ExecuteNmi() {
        if ((this.StateFlags & Z80StateFlags.Halted) != 0) {
            // --- We emulate stepping over the HALT instruction
            this.Registers.PC++;
            this.StateFlags &= Z80StateFlags.InvHalted;
        }
        this.IFF2 = this.IFF1;
        this.IFF1 = false;
        this.Registers.SP--;
        this.ClockP1();
        this.WriteMemory(this.Registers.SP, this.Registers.PC >> 8);
        this.ClockP3();
        this.Registers.SP--;
        this.WriteMemory(this.Registers.SP, this.Registers.PC & 0xFF);
        this.ClockP3();

        // --- NMI address
        this.Registers.PC = 0x0066;
    }

    // Sets the CPU's RESET signal
    SetResetSignal(): void {
        this.IsInterruptBlocked = true;
        this.StateFlags |= Z80StateFlags.Reset;
    }

    // Releases the CPU's RESET signal
    ReleaseResetSignal(): void {
        this.StateFlags &= Z80StateFlags.InvReset;
        this.IsInterruptBlocked = false;
    }

    // ========================================================================
    // Test support methods

    // Allows setting the number of tacts
    SetTacts(tacts: number) {
        this.Tacts = tacts;
    }

    // Sets the specified interrupt mode
    SetInterruptMode(im: number) {
        this.InterruptMode = im;
    }

    // Sets the IFF1 and IFF2 flags to the specified value;
    SetIffValues(value: boolean) {
        this.IFF1 = this.IFF2 = value;
    }

    // Block interrupts
    BlockInterrupt() {
        this.IsInterruptBlocked = true;
    }

    // Removes the CPU from its halted state
    RemoveFromHaltedState() {
        if ((this.StateFlags & Z80StateFlags.Halted) == 0) return;
        this.Registers.PC++;
        this.StateFlags &= Z80StateFlags.InvHalted;
    }

    // =======================================================================
    // Device state management
    GetDeviceState() {
    }

    RestoreDeviceState(state: any) {
    }

    // ========================================================================
    // Instruction execution
    
    // Process Z80 opcodes without a prefix, or with DD and FD prefix
    ProcessStandardOrIndexedOperations() {
        var opMethod = this.IndexMode == OpIndexMode.None
            ? standardOperations[this._opCode]
            : indexedOperations[this._opCode];
        if (opMethod != null) {
            opMethod(this);
        }
    }

    // Process Z80 opcodes with ED prefix
    ProcessEDOperations(){

    }

    // Process Z80 opcodes with CB prefix
    ProcessCBPrefixedOperations() {

    }
}

// ========================================================================
// Processing standard (no prefix) Z80 instructions    

function LdBCNN(cpu: Z80Cpu) {
}

function LdBCiA(cpu: Z80Cpu) {
}

function IncBC(cpu: Z80Cpu) {
}

function IncB(cpu: Z80Cpu) {
}

function DecB(cpu: Z80Cpu) {
}

function LdBN(cpu: Z80Cpu) {
}

function Rlca(cpu: Z80Cpu) {
}

function ExAF(cpu: Z80Cpu) {
}

function AddHLBC(cpu: Z80Cpu) {
}

function LdABCi(cpu: Z80Cpu) {
}

function DecBC(cpu: Z80Cpu) {
}

function IncC(cpu: Z80Cpu) {
}

function DecC(cpu: Z80Cpu) {
}

function LdCN(cpu: Z80Cpu) {
}

function Rrca(cpu: Z80Cpu) {
}

function Djnz(cpu: Z80Cpu) {
}

function LdDENN(cpu: Z80Cpu) {
}

function LdDEiA(cpu: Z80Cpu) {
}

function IncDE(cpu: Z80Cpu) {
}

function IncD(cpu: Z80Cpu) {
}

function DecD(cpu: Z80Cpu) {
}

function LdDN(cpu: Z80Cpu) {
}

function Rla(cpu: Z80Cpu) {
}

function JrE(cpu: Z80Cpu) {
}

function AddHLDE(cpu: Z80Cpu) {
}

function LdADEi(cpu: Z80Cpu) {
}

function DecDE(cpu: Z80Cpu) {
}

function IncE(cpu: Z80Cpu) {
}

function DecE(cpu: Z80Cpu) {
}

function LdEN(cpu: Z80Cpu) {
}

function Rra(cpu: Z80Cpu) {
}

function JrNZ(cpu: Z80Cpu) {
}

function LdHLNN(cpu: Z80Cpu) {
}

function LdNNiHL(cpu: Z80Cpu) {
}

function IncHL(cpu: Z80Cpu) {
}

function IncH(cpu: Z80Cpu) {
}

function DecH(cpu: Z80Cpu) {
}

function LdHN(cpu: Z80Cpu) {
}

function Daa(cpu: Z80Cpu) {
}

function JrZ(cpu: Z80Cpu) {
}

function AddHLHL(cpu: Z80Cpu) {
}

function LdHLNNi(cpu: Z80Cpu) {
}

function DecHL(cpu: Z80Cpu) {
}

function IncL(cpu: Z80Cpu) {
}

function DecL(cpu: Z80Cpu) {
}

function LdLN(cpu: Z80Cpu) {
}

function Cpl(cpu: Z80Cpu) {
}

function JrNC(cpu: Z80Cpu) {
}

function LdSPNN(cpu: Z80Cpu) {
}

function LdNNA(cpu: Z80Cpu) {
}

function IncSP(cpu: Z80Cpu) {
}

function IncHLi(cpu: Z80Cpu) {
}

function DecHLi(cpu: Z80Cpu) {
}

function LdHLiN(cpu: Z80Cpu) {
}

function Scf(cpu: Z80Cpu) {
}

function JrC(cpu: Z80Cpu) {
}

function AddHLSP(cpu: Z80Cpu) {
}

function LdNNiA(cpu: Z80Cpu) {
}

function DecSP(cpu: Z80Cpu) {
}

function IncA(cpu: Z80Cpu) {
}

function DecA(cpu: Z80Cpu) {
}

function LdAN(cpu: Z80Cpu) {
}

function Ccf(cpu: Z80Cpu) {
}

function LdB_C(cpu: Z80Cpu) {
}

function LdB_D(cpu: Z80Cpu) {
}

function LdB_E(cpu: Z80Cpu) {
}

function LdB_H(cpu: Z80Cpu) {
}

function LdB_L(cpu: Z80Cpu) {
}

function LdB_HLi(cpu: Z80Cpu) {
}

function LdB_A(cpu: Z80Cpu) {
}

function LdC_B(cpu: Z80Cpu) {
}

function LdC_D(cpu: Z80Cpu) {
}

function LdC_E(cpu: Z80Cpu) {
}

function LdC_H(cpu: Z80Cpu) {
}

function LdC_L(cpu: Z80Cpu) {
}

function LdC_HLi(cpu: Z80Cpu) {
}

function LdC_A(cpu: Z80Cpu) {
}

function LdD_B(cpu: Z80Cpu) {
}

function LdD_C(cpu: Z80Cpu) {
}

function LdD_E(cpu: Z80Cpu) {
}

function LdD_H(cpu: Z80Cpu) {
}

function LdD_L(cpu: Z80Cpu) {
}

function LdD_HLi(cpu: Z80Cpu) {
}

function LdD_A(cpu: Z80Cpu) {
}

function LdE_B(cpu: Z80Cpu) {
}

function LdE_C(cpu: Z80Cpu) {
}

function LdE_D(cpu: Z80Cpu) {
}

function LdE_H(cpu: Z80Cpu) {
}

function LdE_L(cpu: Z80Cpu) {
}

function LdE_HLi(cpu: Z80Cpu) {
}

function LdE_A(cpu: Z80Cpu) {
}

function LdH_B(cpu: Z80Cpu) {
}

function LdH_C(cpu: Z80Cpu) {
}

function LdH_D(cpu: Z80Cpu) {
}

function LdH_E(cpu: Z80Cpu) {
}

function LdH_L(cpu: Z80Cpu) {
}

function LdH_HLi(cpu: Z80Cpu) {
}

function LdH_A(cpu: Z80Cpu) {
}

function LdL_B(cpu: Z80Cpu) {
}

function LdL_C(cpu: Z80Cpu) {
}

function LdL_D(cpu: Z80Cpu) {
}

function LdL_E(cpu: Z80Cpu) {
}

function LdL_H(cpu: Z80Cpu) {
}

function LdL_HLi(cpu: Z80Cpu) {
}

function LdL_A(cpu: Z80Cpu) {
}

function LdHLi_B(cpu: Z80Cpu) {
}

function LdHLi_C(cpu: Z80Cpu) {
}

function LdHLi_D(cpu: Z80Cpu) {
}

function LdHLi_E(cpu: Z80Cpu) {
}

function LdHLi_H(cpu: Z80Cpu) {
}

function LdHLi_L(cpu: Z80Cpu) {
}

function Halt(cpu: Z80Cpu) {
}

function LdHLi_A(cpu: Z80Cpu) {
}

function LdA_B(cpu: Z80Cpu) {
}

function LdA_C(cpu: Z80Cpu) {
}

function LdA_D(cpu: Z80Cpu) {
}

function LdA_E(cpu: Z80Cpu) {
}

function LdA_H(cpu: Z80Cpu) {
}

function LdA_L(cpu: Z80Cpu) {
}

function LdA_HLi(cpu: Z80Cpu) {
}

function AddA_B(cpu: Z80Cpu) {
}

function AddA_C(cpu: Z80Cpu) {
}

function AddA_D(cpu: Z80Cpu) {
}

function AddA_E(cpu: Z80Cpu) {
}

function AddA_H(cpu: Z80Cpu) {
}

function AddA_L(cpu: Z80Cpu) {
}

function AddA_HLi(cpu: Z80Cpu) {
}

function AddA_A(cpu: Z80Cpu) {
}

function AdcA_B(cpu: Z80Cpu) {
}

function AdcA_C(cpu: Z80Cpu) {
}

function AdcA_D(cpu: Z80Cpu) {
}

function AdcA_E(cpu: Z80Cpu) {
}

function AdcA_H(cpu: Z80Cpu) {
}

function AdcA_L(cpu: Z80Cpu) {
}

function AdcA_HLi(cpu: Z80Cpu) {
}

function AdcA_A(cpu: Z80Cpu) {
}

function SubB(cpu: Z80Cpu) {
}

function SubC(cpu: Z80Cpu) {
}

function SubD(cpu: Z80Cpu) {
}

function SubE(cpu: Z80Cpu) {
}

function SubH(cpu: Z80Cpu) {
}

function SubL(cpu: Z80Cpu) {
}

function SubHLi(cpu: Z80Cpu) {
}

function SubA(cpu: Z80Cpu) {
}

function SbcB(cpu: Z80Cpu) {
}

function SbcC(cpu: Z80Cpu) {
}

function SbcD(cpu: Z80Cpu) {
}

function SbcE(cpu: Z80Cpu) {
}

function SbcH(cpu: Z80Cpu) {
}

function SbcL(cpu: Z80Cpu) {
}

function SbcHLi(cpu: Z80Cpu) {
}

function SbcA(cpu: Z80Cpu) {
}

function AndB(cpu: Z80Cpu) {
}

function AndC(cpu: Z80Cpu) {
}

function AndD(cpu: Z80Cpu) {
}

function AndE(cpu: Z80Cpu) {
}

function AndH(cpu: Z80Cpu) {
}

function AndL(cpu: Z80Cpu) {
}

function AndHLi(cpu: Z80Cpu) {
}

function AndA(cpu: Z80Cpu) {
}

function XorB(cpu: Z80Cpu) {
}

function XorC(cpu: Z80Cpu) {
}

function XorD(cpu: Z80Cpu) {
}

function XorE(cpu: Z80Cpu) {
}

function XorH(cpu: Z80Cpu) {
}

function XorL(cpu: Z80Cpu) {
}

function XorHLi(cpu: Z80Cpu) {
}

function XorA(cpu: Z80Cpu) {
}

function OrB(cpu: Z80Cpu) {
}

function OrC(cpu: Z80Cpu) {
}

function OrD(cpu: Z80Cpu) {
}

function OrE(cpu: Z80Cpu) {
}

function OrH(cpu: Z80Cpu) {
}

function OrL(cpu: Z80Cpu) {
}

function OrHLi(cpu: Z80Cpu) {
}

function OrA(cpu: Z80Cpu) {
}

function CpB(cpu: Z80Cpu) {
}

function CpC(cpu: Z80Cpu) {
}

function CpD(cpu: Z80Cpu) {
}

function CpE(cpu: Z80Cpu) {
}

function CpH(cpu: Z80Cpu) {
}

function CpL(cpu: Z80Cpu) {
}

function CpHLi(cpu: Z80Cpu) {
}

function CpA(cpu: Z80Cpu) {
}

function RetNZ(cpu: Z80Cpu) {
}

function PopBC(cpu: Z80Cpu) {
}

function JpNZ_NN(cpu: Z80Cpu) {
}

function JpNN(cpu: Z80Cpu) {
}

function CallNZ(cpu: Z80Cpu) {
}

function PushBC(cpu: Z80Cpu) {
}

function AluAN(cpu: Z80Cpu) {
}

function Rst00(cpu: Z80Cpu) {
}

function RetZ(cpu: Z80Cpu) {
}

function Ret(cpu: Z80Cpu) {
}

function JpZ_NN(cpu: Z80Cpu) {
}

function CallZ(cpu: Z80Cpu) {
}

function CallNN(cpu: Z80Cpu) {
}

function Rst08(cpu: Z80Cpu) {
}

function RetNC(cpu: Z80Cpu) {
}

function PopDE(cpu: Z80Cpu) {
}

function JpNC_NN(cpu: Z80Cpu) {
}

function OutNA(cpu: Z80Cpu) {
}

function CallNC(cpu: Z80Cpu) {
}

function PushDE(cpu: Z80Cpu) {
}

function Rst10(cpu: Z80Cpu) {
}

function RetC(cpu: Z80Cpu) {
}

function Exx(cpu: Z80Cpu) {
}

function JpC_NN(cpu: Z80Cpu) {
}

function InAN(cpu: Z80Cpu) {
}

function CallC(cpu: Z80Cpu) {
}

function Rst18(cpu: Z80Cpu) {
}

function RetPO(cpu: Z80Cpu) {
}

function PopHL(cpu: Z80Cpu) {
}

function JpPO_NN(cpu: Z80Cpu) {
}

function ExSPiHL(cpu: Z80Cpu) {
}

function CallPO(cpu: Z80Cpu) {
}

function PushHL(cpu: Z80Cpu) {
}

function Rst20(cpu: Z80Cpu) {
}

function RetPE(cpu: Z80Cpu) {
}

function JpHL(cpu: Z80Cpu) {
}

function JpPE_NN(cpu: Z80Cpu) {
}

function ExDEHL(cpu: Z80Cpu) {
}

function CallPE(cpu: Z80Cpu) {
}

function Rst28(cpu: Z80Cpu) {
}

function RetP(cpu: Z80Cpu) {
}

function PopAF(cpu: Z80Cpu) {
}

function JpP_NN(cpu: Z80Cpu) {
}

function Di(cpu: Z80Cpu) {
}

function CallP(cpu: Z80Cpu) {
}

function PushAF(cpu: Z80Cpu) {
}

function Rst30(cpu: Z80Cpu) {
}

function RetM(cpu: Z80Cpu) {
}

function LdSPHL(cpu: Z80Cpu) {
}

function JpM_NN(cpu: Z80Cpu) {
}

function Ei(cpu: Z80Cpu) {
}

function CallM(cpu: Z80Cpu) {
}

function Rst38(cpu: Z80Cpu) {
}

// ========================================================================
// Processing extended (ED prefix) Z80 instructions    

function Swapnib(cpu: Z80Cpu) {
}

function MirrA(cpu: Z80Cpu) {
}

function MirrDE(cpu: Z80Cpu) {
}

function TestN(cpu: Z80Cpu) {
}

function Mul(cpu: Z80Cpu) {
}

function AddHL_A(cpu: Z80Cpu) {
}

function AddDE_A(cpu: Z80Cpu) {
}

function AddBC_A(cpu: Z80Cpu) {
}

function AddHLNN(cpu: Z80Cpu) {
}

function AddDENN(cpu: Z80Cpu) {
}

function AddBCNN(cpu: Z80Cpu) {
}

function InB_C(cpu: Z80Cpu) {
}

function OutC_B(cpu: Z80Cpu) {
}

function SbcHL_QQ(cpu: Z80Cpu) {
}

function LdNNi_QQ(cpu: Z80Cpu) {
}

function Neg(cpu: Z80Cpu) {
}

function Retn(cpu: Z80Cpu) {
}

function ImN(cpu: Z80Cpu) {
}

function LdXR_A(cpu: Z80Cpu) {
}

function InC_C(cpu: Z80Cpu) {
}

function OutC_C(cpu: Z80Cpu) {
}

function AdcHL_QQ(cpu: Z80Cpu) {
}

function LdQQ_NNi(cpu: Z80Cpu) {
}

function Reti(cpu: Z80Cpu) {
}

function InD_C(cpu: Z80Cpu) {
}

function OutC_D(cpu: Z80Cpu) {
}

function LdA_XR(cpu: Z80Cpu) {
}

function InE_C(cpu: Z80Cpu) {
}

function OutC_E(cpu: Z80Cpu) {
}

function Rrd(cpu: Z80Cpu) {
}

function InH_C(cpu: Z80Cpu) {
}

function OutC_H(cpu: Z80Cpu) {
}

function Rld(cpu: Z80Cpu) {
}

function InL_C(cpu: Z80Cpu) {
}

function OutC_L(cpu: Z80Cpu) {
}

function InF_C(cpu: Z80Cpu) {
}

function OutC_0(cpu: Z80Cpu) {
}

function InA_C(cpu: Z80Cpu) {
}

function OutC_A(cpu: Z80Cpu) {
}

function LdSP_NNi(cpu: Z80Cpu) {
}

function PushNN(cpu: Z80Cpu) {
}

function Outinb(cpu: Z80Cpu) {
}

function Nextreg(cpu: Z80Cpu) {
}

function NextregA(cpu: Z80Cpu) {
}

function Pixeldn(cpu: Z80Cpu) {
}

function Pixelad(cpu: Z80Cpu) {
}

function Setae(cpu: Z80Cpu) {
}

function Ldi(cpu: Z80Cpu) {
}

function Cpi(cpu: Z80Cpu) {
}

function Ini(cpu: Z80Cpu) {
}

function Outi(cpu: Z80Cpu) {
}

function Ldix(cpu: Z80Cpu) {
}

function Ldd(cpu: Z80Cpu) {
}

function Cpd(cpu: Z80Cpu) {
}

function Ind(cpu: Z80Cpu) {
}

function Outd(cpu: Z80Cpu) {
}

function Lddx(cpu: Z80Cpu) {
}

function Ldir(cpu: Z80Cpu) {
}

function Cpir(cpu: Z80Cpu) {
}

function Inir(cpu: Z80Cpu) {
}

function Otir(cpu: Z80Cpu) {
}

function Ldirx(cpu: Z80Cpu) {
}

function Lddr(cpu: Z80Cpu) {
}

function Cpdr(cpu: Z80Cpu) {
}

function Indr(cpu: Z80Cpu) {
}

function Otdr(cpu: Z80Cpu) {
}

function Lddrx(cpu: Z80Cpu) {
}

function Ldirscale(cpu: Z80Cpu) {
}

function Ldpirx(cpu: Z80Cpu) {
}

// ========================================================================
// Processing bit (CB prefix) Z80 instructions    

function RlcB(cpu: Z80Cpu) {
}

function RlcC(cpu: Z80Cpu) {
}

function RlcD(cpu: Z80Cpu) {
}

function RlcE(cpu: Z80Cpu) {
}

function RlcH(cpu: Z80Cpu) {
}

function RlcL(cpu: Z80Cpu) {
}

function RlcHLi(cpu: Z80Cpu) {
}

function RlcA(cpu: Z80Cpu) {
}

function RrcB(cpu: Z80Cpu) {
}

function RrcC(cpu: Z80Cpu) {
}

function RrcD(cpu: Z80Cpu) {
}

function RrcE(cpu: Z80Cpu) {
}

function RrcH(cpu: Z80Cpu) {
}

function RrcL(cpu: Z80Cpu) {
}

function RrcHLi(cpu: Z80Cpu) {
}

function RrcA(cpu: Z80Cpu) {
}

function RlB(cpu: Z80Cpu) {
}

function RlC(cpu: Z80Cpu) {
}

function RlD(cpu: Z80Cpu) {
}

function RlE(cpu: Z80Cpu) {
}

function RlH(cpu: Z80Cpu) {
}

function RlL(cpu: Z80Cpu) {
}

function RlHLi(cpu: Z80Cpu) {
}

function RlA(cpu: Z80Cpu) {
}

function RrB(cpu: Z80Cpu) {
}

function RrC(cpu: Z80Cpu) {
}

function RrD(cpu: Z80Cpu) {
}

function RrE(cpu: Z80Cpu) {
}

function RrH(cpu: Z80Cpu) {
}

function RrL(cpu: Z80Cpu) {
}

function RrHLi(cpu: Z80Cpu) {
}

function RrA(cpu: Z80Cpu) {
}

function SlaB(cpu: Z80Cpu) {
}

function SlaC(cpu: Z80Cpu) {
}

function SlaD(cpu: Z80Cpu) {
}

function SlaE(cpu: Z80Cpu) {
}

function SlaH(cpu: Z80Cpu) {
}

function SlaL(cpu: Z80Cpu) {
}

function SlaHLi(cpu: Z80Cpu) {
}

function SlaA(cpu: Z80Cpu) {
}

function SraB(cpu: Z80Cpu) {
}

function SraC(cpu: Z80Cpu) {
}

function SraD(cpu: Z80Cpu) {
}

function SraE(cpu: Z80Cpu) {
}

function SraH(cpu: Z80Cpu) {
}

function SraL(cpu: Z80Cpu) {
}

function SraHLi(cpu: Z80Cpu) {
}

function SraA(cpu: Z80Cpu) {
}

function SllB(cpu: Z80Cpu) {
}

function SllC(cpu: Z80Cpu) {
}

function SllD(cpu: Z80Cpu) {
}

function SllE(cpu: Z80Cpu) {
}

function SllH(cpu: Z80Cpu) {
}

function SllL(cpu: Z80Cpu) {
}

function SllHLi(cpu: Z80Cpu) {
}

function SllA(cpu: Z80Cpu) {
}

function SrlB(cpu: Z80Cpu) {
}

function SrlC(cpu: Z80Cpu) {
}

function SrlD(cpu: Z80Cpu) {
}

function SrlE(cpu: Z80Cpu) {
}

function SrlH(cpu: Z80Cpu) {
}

function SrlL(cpu: Z80Cpu) {
}

function SrlHLi(cpu: Z80Cpu) {
}

function SrlA(cpu: Z80Cpu) {
}

function BitN_Q(cpu: Z80Cpu) {
}

function BinN_HLi(cpu: Z80Cpu) {
}

function ResN_Q(cpu: Z80Cpu) {
}

function ResN_HLi(cpu: Z80Cpu) {
}

function SetN_Q(cpu: Z80Cpu) {
}

function SetN_HLi(cpu: Z80Cpu) {
}

// ========================================================================
// Processing indexed (DD or FD prefix) Z80 instructions    

function AddIX_QQ(cpu: Z80Cpu) {
}

function LdIX_NN(cpu: Z80Cpu) {
}

function LdNNi_IX(cpu: Z80Cpu) {
}

function IncIX(cpu: Z80Cpu) {
}

function IncXH(cpu: Z80Cpu) {
}

function DecXH(cpu: Z80Cpu) {
}

function LdXH_N(cpu: Z80Cpu) {
}

function LdIX_NNi(cpu: Z80Cpu) {
}

function DecIX(cpu: Z80Cpu) {
}

function DeccXH(cpu: Z80Cpu) {
}

function IncXL(cpu: Z80Cpu) {
}

function DecXL(cpu: Z80Cpu) {
}

function LdXL_N(cpu: Z80Cpu) {
}

function IncIXi(cpu: Z80Cpu) {
}

function DecIXi(cpu: Z80Cpu) {
}

function LdIXi_NN(cpu: Z80Cpu) {
}

function LdQ_XH(cpu: Z80Cpu) {
}

function LdQ_XL(cpu: Z80Cpu) {
}

function LdQ_IXi(cpu: Z80Cpu) {
}

function LdXH_Q(cpu: Z80Cpu) {
}

function LdXH_XL(cpu: Z80Cpu) {
}

function LdXL_Q(cpu: Z80Cpu) {
}

function LdIXi_Q(cpu: Z80Cpu) {
}

function LdXL_XH(cpu: Z80Cpu) {
}

function AluA_XH(cpu: Z80Cpu) {
}

function AluA_XL(cpu: Z80Cpu) {
}

function AluA_IXi(cpu: Z80Cpu) {
}

function ExSPiIX(cpu: Z80Cpu) {
}

function PushIX(cpu: Z80Cpu) {
}

function PopIX(cpu: Z80Cpu) {
}

function JpIXi(cpu: Z80Cpu) {
}

function LdSPIX(cpu: Z80Cpu) {
}

// ========================================================================
// Processing indexed bit (CB/DD or CB/FD prefix) Z80 instructions    

function XrlcQ(cpu: Z80Cpu) {
}

function Xrlc(cpu: Z80Cpu) {
}

function XrrcQ(cpu: Z80Cpu) {
}

function Xrrc(cpu: Z80Cpu) {
}

function XrlQ(cpu: Z80Cpu) {
}

function Xrl(cpu: Z80Cpu) {
}

function XrrQ(cpu: Z80Cpu) {
}

function Xrr(cpu: Z80Cpu) {
}

function XslaQ(cpu: Z80Cpu) {
}

function Xsla(cpu: Z80Cpu) {
}

function XsraQ(cpu: Z80Cpu) {
}

function Xsra(cpu: Z80Cpu) {
}

function XsllQ(cpu: Z80Cpu) {
}

function Xsll(cpu: Z80Cpu) {
}

function XsrlQ(cpu: Z80Cpu) {
}

function Xsrl(cpu: Z80Cpu) {
}

function XbitN(cpu: Z80Cpu) {
}

function Xres(cpu: Z80Cpu) {
}

function Xset(cpu: Z80Cpu) {
}

// ========================================================================
// Alu operations

function AluADD(right: number, cf: boolean) {
}

function AluADC(right: number, cf: boolean) {
}

function AluSUB(right: number, cf: boolean) {
}

function AluSBC(right: number, cf: boolean) {
}

function AluAND(right: number, cf: boolean) {
}

function AluXOR(right: number, cf: boolean) {
}

function AluOR(right: number, cf: boolean) {
}

function AluCP(right: number, cf: boolean) {
}
