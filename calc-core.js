const TOKEN=/\s*(?:(\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?|([A-Za-z]+)|(\*\*|[+\-*/^(),%!]))/y;
const FUNCTIONS_WITHOUT_PARENS=/\b((?:a?(?:sin|cos|tan)h?|ln|log|cbrt))\s*(\d+(?:\.\d+)?)/g;

function tokenize(source, functions) {
  const tokens=[];
  TOKEN.lastIndex=0;
  while(TOKEN.lastIndex<source.length) {
    const at=TOKEN.lastIndex, match=TOKEN.exec(source);
    if(!match) throw new Error('Invalid character in expression');
    if(match[1]!==undefined) tokens.push({type:'number',value:Number(match[0].trim())});
    else if(match[2]!==undefined) tokens.push({type:'identifier',value:match[2]});
    else tokens.push({type:match[3]==='('? 'open':match[3]===')'?'close':match[3]===','?'comma':'operator',value:match[3]});
    if(TOKEN.lastIndex<=at) throw new Error('Could not read expression');
  }
  const expanded=[];
  const canEnd=t=>t.type==='number'||t.type==='close'||(t.type==='identifier'&&Object.hasOwn(functions,t.value)&&typeof functions[t.value]!=='function');
  const canStart=t=>t.type==='number'||t.type==='identifier'||t.type==='open';
  for(const token of tokens) {
    const previous=expanded[expanded.length-1];
    if(previous&&canEnd(previous)&&canStart(token)&&!(previous.type==='identifier'&&typeof functions[previous.value]==='function'&&token.type==='open')) expanded.push({type:'operator',value:'*'});
    expanded.push(token);
  }
  return expanded;
}

export function evaluateExpression(expression,{functions={},ans=0,x=0}={}) {
  let source=String(expression??'').trim();
  if(!source) throw new Error('Expression is empty');
  source=source.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/π/g,'PI').replace(/²/g,'^2').replace(/³/g,'^3').replace(/√\s*(\d+(?:\.\d+)?)/g,'sqrt($1)').replace(/√/g,'sqrt').replace(/ANS/g,'ans');
  source=source.replace(FUNCTIONS_WITHOUT_PARENS,'$1($2)'); 
  let depth=0;
  for(const c of source){if(c==='(')depth++;else if(c===')')depth--;}
  if(depth<0) throw new Error('Unexpected closing parenthesis');
  if(depth>0) source+=')'.repeat(depth);
  const tokens=tokenize(source,functions);
  let i=0;
  const peek=()=>tokens[i];
  const take=()=>tokens[i++];
  const precedence={'+' : 10,'-' : 10,'*':20,'/':20,'^':40,'**':40};
  function call(name) {
    if(typeof functions[name]!=='function') throw new Error('Unknown function: '+name);
    take();
    const args=[];
    if(peek()?.type!=='close') {
      do {args.push(parse(0));if(peek()?.type!=='comma')break;take();} while(true);
    }
    if(peek()?.type!=='close') throw new Error('Missing closing parenthesis');
    take();
    return functions[name](...args);
  }
  function prefix() {
    const t=take();
    if(!t) throw new Error('Expected a value');
    if(t.type==='number') return t.value;
    if(t.type==='operator'&&(t.value==='+'||t.value==='-')) {const value=parse(30);return t.value==='-'?-value:value;}
    if(t.type==='open') {const value=parse(0);if(peek()?.type!=='close')throw new Error('Missing closing parenthesis');take();return value;}
    if(t.type==='identifier') {
      if(peek()?.type==='open') return call(t.value);
      if(t.value==='ans') return ans;
      if(t.value==='x') return x;
      if(Object.hasOwn(functions,t.value)&&typeof functions[t.value]!=='function') return functions[t.value];
      throw new Error('Unknown value: '+t.value);
    }
    throw new Error('Expected a value');
  }
  function parse(min=0) {
    let left=prefix();
    while(peek()) {
      const t=peek();
      if(t.type==='operator'&&(t.value==='!'||t.value==='%')) {
        take();
        if(t.value==='!') {if(!Number.isInteger(left)||left<0)throw new Error('Factorial needs a non-negative integer');left=functions.fact(left);}
        else left/=100;
        continue;
      }
      if(t.type!=='operator'||precedence[t.value]===undefined||precedence[t.value]<min) break;
      take();
      const p=precedence[t.value],right=parse((t.value==='^'||t.value==='**')?p:p+1);
      if(t.value==='+')left+=right;else if(t.value==='-')left-=right;else if(t.value==='*')left*=right;else if(t.value==='/')left/=right;else left=left**right;
    }
    return left;
  }
  const result=parse(0);
  if(i!==tokens.length) throw new Error('Unexpected token: '+tokens[i].value);
  return result;
}
