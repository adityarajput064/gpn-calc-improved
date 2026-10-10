export const FORMULAS=[
{n:'Stress  σ = F / A',i:[['F','Force F (N)',1000],['A','Area A (mm²)',100]],o:[['Stress σ',v=>v.F/v.A,'MPa']],t:'N / mm² = MPa'},
{n:"Young's modulus  E = σ / ε",i:[['s','Stress σ (MPa)',200],['ep','Strain ε',0.001]],o:[['Modulus E',v=>v.s/v.ep/1000,'GPa']]},
{n:'Factor of safety',i:[['y','Yield / ultimate strength (MPa)',250],['w','Working stress (MPa)',100]],o:[['FOS',v=>v.y/v.w,'']]},
{n:'Torsion of solid shaft  τ = 16T / πd³',i:[['T','Torque T (N·m)',500],['d','Diameter d (mm)',40]],o:[['Shear stress τ',v=>16*v.T*1000/(Math.PI*v.d**3),'MPa'],['Angle per metre (G=80 GPa)',v=>(v.T*1000/(80000*Math.PI*v.d**4/32))*1000*180/Math.PI,'°/m']]},
{n:'Power from torque & speed',i:[['T','Torque T (N·m)',200],['N','Speed N (rpm)',1500]],o:[['Power P',v=>2*Math.PI*v.N*v.T/60000,'kW'],['Power P',v=>2*Math.PI*v.N*v.T/60/745.7,'hp']]},
{n:'Beam: simply supported, centre load',i:[['F','Load F (N)',5000],['L','Span L (mm)',1000],['E','E (GPa)',200],['I','I (mm⁴)',500000]],o:[['Max deflection δ',v=>v.F*v.L**3/(48*v.E*1000*v.I),'mm'],['Max moment M',v=>v.F*v.L/4/1000,'N·m'],['Reaction each end',v=>v.F/2,'N']]},
{n:'Beam: cantilever, end load',i:[['F','Load F (N)',1000],['L','Length L (mm)',500],['E','E (GPa)',200],['I','I (mm⁴)',200000]],o:[['Tip deflection δ',v=>v.F*v.L**3/(3*v.E*1000*v.I),'mm'],['Max moment M',v=>v.F*v.L/1000,'N·m']]},
{n:'Moment of inertia: rectangle & circle',i:[['b','Width b (mm)',50],['h','Height h (mm)',100],['d','Circle dia d (mm)',50]],o:[['Rectangle I = bh³/12',v=>v.b*v.h**3/12,'mm⁴'],['Circle I = πd⁴/64',v=>Math.PI*v.d**4/64,'mm⁴'],['Circle polar J',v=>Math.PI*v.d**4/32,'mm⁴']]},
{n:'Bending stress  σ = M·y / I',i:[['M','Moment M (N·m)',500],['y','Distance y (mm)',25],['I','I (mm⁴)',300000]],o:[['Bending stress σ',v=>v.M*1000*v.y/v.I,'MPa']]},
{n:'Gear / belt ratio',i:[['z1','Driver teeth / dia',20],['z2','Driven teeth / dia',60],['n1','Driver speed (rpm)',1440]],o:[['Gear ratio',v=>v.z2/v.z1,''],['Driven speed',v=>v.n1*v.z1/v.z2,'rpm']]},
{n:'Kinetic & potential energy',i:[['m','Mass m (kg)',10],['v','Velocity v (m/s)',5],['h','Height h (m)',2]],o:[['KE = ½mv²',v=>.5*v.m*v.v**2,'J'],['PE = mgh',v=>v.m*9.80665*v.h,'J']]},
{n:'Reynolds number',i:[['r','Density ρ (kg/m³)',1000],['v','Velocity v (m/s)',2],['D','Diameter D (m)',0.05],['mu','Viscosity μ (Pa·s)',0.001]],o:[['Re',v=>v.r*v.v*v.D/v.mu,''],['Flow',v=>v.r*v.v*v.D/v.mu<2300?'Laminar':v.r*v.v*v.D/v.mu>4000?'Turbulent':'Transitional','']]},
{n:'Conduction  Q = kAΔT / L',i:[['k','k (W/m·K)',50],['A','Area (m²)',0.1],['dT','ΔT (K)',80],['L','Thickness L (m)',0.02]],o:[['Heat rate Q',v=>v.k*v.A*v.dT/v.L,'W']]},
{n:'Carnot efficiency',i:[['th','Hot T (K)',800],['tc','Cold T (K)',300]],o:[['η',v=>(1-v.tc/v.th)*100,'%']]},
{n:'Euler buckling (pinned-pinned)',i:[['E','E (GPa)',200],['I','I (mm⁴)',100000],['L','Length L (mm)',1000]],o:[['Critical load Pcr',v=>Math.PI**2*v.E*1000*v.I/v.L**2,'N']]},
{n:'Thin cylinder (pressure vessel)',i:[['p','Pressure p (MPa)',2],['d','Inner dia d (mm)',500],['t','Thickness t (mm)',8]],o:[['Hoop stress pd/2t',v=>v.p*v.d/(2*v.t),'MPa'],['Longitudinal pd/4t',v=>v.p*v.d/(4*v.t),'MPa']]}
];
FORMULAS.push(
{n:'Thermo: ideal gas, find T (PV = mRT)',i:[['P','Pressure P (kPa)',101.325],['V','Volume V (m³)',1],['m','Mass m (kg)',1.2],['R','R (J/kg·K)',287]],o:[['Temperature T',v=>v.P*1000*v.V/(v.m*v.R),'K'],['Temperature',v=>v.P*1000*v.V/(v.m*v.R)-273.15,'°C']]},
{n:'Thermo: adiabatic compression',i:[['T1','T₁ (K)',300],['P1','P₁ (kPa)',100],['P2','P₂ (kPa)',800],['g','γ',1.4]],o:[['T₂ = T₁(P₂/P₁)^((γ−1)/γ)',v=>v.T1*(v.P2/v.P1)**((v.g-1)/v.g),'K'],['Work per kg (cv=718)',v=>718*(v.T1*(v.P2/v.P1)**((v.g-1)/v.g)-v.T1)/1000,'kJ/kg']]},
{n:'Thermo: Otto cycle efficiency',i:[['r','Compression ratio r',8],['g','γ',1.4]],o:[['η = 1 − 1/r^(γ−1)',v=>(1-1/v.r**(v.g-1))*100,'%']]},
{n:'Thermo: heat Q = m·c·ΔT',i:[['m','Mass m (kg)',2],['c','c (kJ/kg·K)',4.186],['dT','ΔT (K)',50]],o:[['Heat Q',v=>v.m*v.c*v.dT,'kJ']]},
{n:'Gear: spur gear geometry',i:[['m','Module m (mm)',2],['z1','Pinion teeth z₁',20],['z2','Gear teeth z₂',50]],o:[['Pitch dia pinion',v=>v.m*v.z1,'mm'],['Pitch dia gear',v=>v.m*v.z2,'mm'],['Centre distance',v=>v.m*(v.z1+v.z2)/2,'mm'],['Addendum dia pinion',v=>v.m*(v.z1+2),'mm'],['Circular pitch',v=>Math.PI*v.m,'mm']]},
{n:'Gear: Lewis tooth stress',i:[['T','Torque T (N·m)',50],['m','Module m (mm)',3],['z','Teeth z',24],['b','Face width b (mm)',30],['Y','Lewis factor Y',0.32]],o:[['Tangential force Ft',v=>2000*v.T/(v.m*v.z),'N'],['Bending stress Ft/(b·m·Y)',v=>2000*v.T/(v.m*v.z)/(v.b*v.m*v.Y),'MPa']]},
{n:'Bearing: L10 life',i:[['C','Dynamic rating C (kN)',25],['P','Equivalent load P (kN)',5],['n','Speed (rpm)',1500],['p','Exponent (3 ball, 10/3 roller)',3]],o:[['L10 = (C/P)^p',v=>(v.C/v.P)**v.p,'million rev'],['Life',v=>(v.C/v.P)**v.p*1e6/(60*v.n),'hours']]},
{n:'Weld: fillet in direct shear',i:[['F','Load F (N)',20000],['s','Leg size s (mm)',6],['L','Weld length L (mm)',100]],o:[['Throat 0.707·s',v=>.707*v.s,'mm'],['Shear stress τ',v=>v.F/(.707*v.s*v.L),'MPa'],['Capacity per mm at τ=100',v=>.707*v.s*100,'N/mm']]},
{n:'Bolt: stress & tightening torque',i:[['F','Axial load F (N)',10000],['As','Stress area As (mm²)',84.3],['d','Nominal dia d (mm)',12],['K','Torque coeff K',0.2]],o:[['Tensile stress',v=>v.F/v.As,'MPa'],['Tightening torque K·d·F',v=>v.K*v.d*v.F/1000,'N·m']],t:'As: M6 20.1 · M8 36.6 · M10 58 · M12 84.3 · M16 157 · M20 245 mm²'}
);
