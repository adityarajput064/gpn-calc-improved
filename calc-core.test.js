import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateExpression } from '../calc-core.js';
import { FORMULAS } from '../formulas.js';

const F={PI:Math.PI,e:Math.E,ans:42,fact:n=>{let r=1;for(let i=2;i<=n;i++)r*=i;return r;},sin:x=>Math.sin(x*Math.PI/180),cos:x=>Math.cos(x*Math.PI/180),sqrt:Math.sqrt,abs:Math.abs};
const ev=(s,x=0)=>evaluateExpression(s,{functions:F,ans:42,x});

test('parses positive and negative scientific notation',()=>{
 assert.equal(ev('1e3'),1000);
 assert.equal(ev('2.5E-4'),0.00025);
 assert.ok(Math.abs(ev('5.670374e-8')-5.670374e-8)<1e-20);
});
test('supports calculator notation and precedence',()=>{
 assert.equal(ev('2π'),2*Math.PI);
 assert.equal(ev('2(3+4)'),14);
 assert.equal(ev('-2^2'),-4);
 assert.equal(ev('2^3^2'),512);
 assert.equal(ev('50%'),0.5);
 assert.equal(ev('(3+2)!'),120);
 assert.ok(Math.abs(ev('sin 30')-0.5)<1e-12);
 assert.equal(ev('ANS+x',3),45);
});
test('rejects unknown names and malformed expressions',()=>{
 assert.throws(()=>ev('globalThis.alert(1)'));
 assert.throws(()=>ev('2+'));
 assert.throws(()=>ev(')1('));
 assert.throws(()=>ev('(-1)!'));
});

test('engineering formula defaults produce expected values',()=>{
 const run=(name)=>{const f=FORMULAS.find(item=>item.n===name);assert.ok(f,name);const values=Object.fromEntries(f.i.map(([id,,value])=>[id,value]));return f.o.map(([,calculate])=>calculate(values));};
 assert.equal(run('Stress  σ = F / A')[0],10);
 assert.equal(run("Young's modulus  E = σ / ε")[0],200);
 assert.ok(Math.abs(run('Power from torque & speed')[0]-31.4159265359)<1e-8);
 assert.ok(Math.abs(run('Thermo: ideal gas, find T (PV = mRT)')[0]-294.2073)<0.001);
 assert.equal(run('Thin cylinder (pressure vessel)')[0],62.5);
});
