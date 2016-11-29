// @flow

import type {
  AST,
  AssignmentNode,
  BinaryNode,
  ConditionNode,
  LambdaNode,
  CallNode,
  ProgramNode,
} from './Parser';

export default function evaluate(expression: AST, scope: any): any {
  switch (expression.type) {
    case 'Number':
    case 'String':
    case 'Boolean':
      return expression.value;
    case 'Variable':
      return scope[expression.value];
    case 'Assignment':
      return assignment(expression, scope);
    case 'Binary':
      return binary(expression, scope);
    case 'Condition':
      return condition(expression, scope);
    case 'Lambda':
      return lambda(expression, scope);
    case 'Call':
      return call(expression, scope);
    case 'Program':
      return program(expression, scope);
    default:
      throw Error(`Unable to evaluate ${expression.type}`);
  }
}

function assignment(expression: AssignmentNode, scope: any): any {
  const { lhs, rhs } = expression;
  if (lhs.type !== 'Variable') {
    const str = JSON.stringify(lhs);
    throw new Error(`Can't assign to ${str}`);
  }
  const value = evaluate(rhs, scope);
  scope[lhs.value] = value; // eslint-disable-line no-param-reassign
  return value;
}

function binary(expression: BinaryNode, scope: any): any {
  const { lhs, rhs, operator } = expression;
  const lValue = evaluate(lhs, scope);
  const rValue = evaluate(rhs, scope);
  return applyOperator(operator, lValue, rValue);
}

function applyOperator(operator: string, lhs: any, rhs: any): any {
  function nonZero(x: number) {
    if (x === 0) throw new Error('Divide by zero');
    return x;
  }

  switch (operator) {
    case '+': return lhs + rhs;
    case '-': return lhs - rhs;
    case '*': return lhs * rhs;
    case '/': return lhs / nonZero(rhs);
    case '%': return lhs % nonZero(rhs);
    case '&&': return lhs !== false && rhs;
    case '||': return lhs !== false ? lhs : rhs;
    case '<': return lhs < rhs;
    case '>': return lhs > rhs;
    case '<=': return lhs <= rhs;
    case '>=': return lhs >= rhs;
    case '==': return lhs === rhs;
    case '!=': return lhs !== rhs;
    default:
      throw new Error(`Can't apply operator ${operator}`);
  }
}

function condition(expression: ConditionNode, scope: any): any {
  const cond = evaluate(expression.condition, scope);
  if (cond !== false) {
    return evaluate(expression.then, scope);
  }
  return expression.else ?
    evaluate(expression.else, scope) :
    false;
}

function lambda(expression: LambdaNode, scope: any): any {
  const { variables, body } = expression;
  return function lambdaFunc(...args) {
    const nested = scope.nested();
    variables.forEach((name, idx) => nested.define(name, args[idx]));
    return evaluate(body, scope);
  };
}

function call(expression: CallNode, scope: any): any {
  const func = evaluate(expression.function, scope);
  const args = expression.arguments.map(arg => evaluate(arg, scope));
  return func(...args);
}

function program(expression: ProgramNode, scope: any): any {
  const results = expression.program.map(exp => evaluate(exp, scope));
  return results[results.length - 1];
}
