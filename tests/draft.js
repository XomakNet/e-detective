var A=LogicVariable("A");
var B=LogicVariable("B");
var C=LogicVariable("C");
var D=LogicVariable("D");
var e1=LogicAND(A,B);
var e2=LogicAND(B,A);
var e3=LogicAND(A,D);
var e4=LogicAND(A, LogicOR(A, B));
var e5=LogicNOT(LogicOR(LogicNOT(LogicAND(LogicNOT(LogicAND(B,LogicNOT(C))),A)),D));
var e6=LogicAND(A, LogicOR(A, B));
var e7=LogicAND(A,LogicAND(LogicOR(B,A), LogicAND(LogicOR(A, LogicOR(C, B)), LogicAND(LogicOR(A, LogicOR(C, B)), LogicOR(B, LogicOR(A, D))))));
e5=e5.getWithoutComplexInversion();
var e8=LogicOR(A, LogicAND(LogicNOT(A),B));
var e9=LogicOR(LogicAND(A,B), LogicAND(C,D));