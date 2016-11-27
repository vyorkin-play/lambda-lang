// @flow

import TokenStream from './TokenStream';
import type { Token, TokenType } from './TokenStream';

/* eslint-disable no-use-before-define */
type ParseFn<R: string | AST> = () => R;
type DelimitedOptions = {
  start: string,
  stop: string,
  separator: string,
};

type NumberNode = { type: 'Number', value: number };
type StringNode = { type: 'String', value: string };
type BooleanNode = { type: 'Boolean', value: boolean };
type VariableNode = { type: 'Variable', value: string };
type LambdaNode = { type: 'Lambda', variables: string[], body: AST };
type CallNode = { type: 'Call', function: AST, arguments: AST[] };
type ConditionNode = { type: 'Condition', condition: AST, then: AST, else?: AST };
type AssignmentNode = { type: 'Assignment', lhs: AST, rhs: AST };
type BinaryNode = { type: 'Binary', operator: string, lhs: AST, rhs: AST };
type ProgramNode = { type: 'Program', program: AST[] };

type AST =
  | NumberNode
  | StringNode
  | BooleanNode
  | VariableNode
  | LambdaNode
  | CallNode
  | ConditionNode
  | AssignmentNode
  | BinaryNode
  | ProgramNode;
/* eslint-enable no-use-before-define */

const Bool = (value: boolean) => ({ type: 'Boolean', value });

/*
 * A simple recursive descent parser.
 */
export default class Parser {
  static precedence = {
    '=': 1,
    '||': 2,
    '&&': 3,
    '>': 7,
    '<': 7,
    '<=': 7,
    '>=': 7,
    '==': 7,
    '!=': 7,
    '+': 10,
    '-': 10,
    '*': 20,
    '/': 20,
    '%': 20,
  };

  input: TokenStream;

  constructor(input: TokenStream) {
    this.input = input;
  }

  parse(): AST {
    const program = [];

    while (!this.input.eof()) {
      const ast = this.parseExpression();
      program.push(ast);

      if (!this.input.eof()) {
        this.skip(';', 'Punctuation');
      }
    }

    return { type: 'Program', program };
  }

  parseProgram(): AST {
    const program = this.parseDelimited(
      this.parseExpression, {
        start: '{',
        stop: '}',
        separator: ';',
      },
    );

    if (program.length === 0) return Bool(false);
    if (program.length === 1) return program[0];

    return { type: 'Program', program };
  }

  parseCondition(): ConditionNode {
    this.skip('if', 'Keyword');
    const condition = this.parseExpression();
    if (!this.is('{', 'Punctuation')) {
      this.skip('then', 'Keyword');
    }
    const then = this.parseExpression();
    return this.is('else', 'Keyword') ?
      { type: 'Condition', condition, then, else: this.parseExpression() } :
      { type: 'Condition', condition, then };
  }

  parseLambda(): LambdaNode {
    const variables = this.parseDelimited(
      this.parseVariable, {
        start: '(',
        stop: ')',
        separator: ',',
      }
    );
    const body = this.parseExpression();
    return { type: 'Lambda', variables, body };
  }

  parseDelimited<T: string | AST>(parse: ParseFn<T>, options: DelimitedOptions): T[] {
    const { start, stop, separator } = options;

    let first = true;
    const result = [];

    this.skip(start, 'Punctuation');

    while (!this.input.eof()) {
      if (this.is(stop, 'Punctuation')) break;

      if (first) {
        first = false;
      } else {
        this.skip(separator, 'Punctuation');
      }

      if (this.is(stop, 'Punctuation')) break;

      const token = parse();
      result.push(token);
    }

    this.skip(stop, 'Punctuation');

    return result;
  }

  parseVariable = (): string => {
    const token = this.next();
    if (token.type !== 'Variable') {
      throw this.input.error('Expecting variable name');
    }
    return token.value.toString();
  };

  parseExpression = (): AST => this.maybeCall(
    () => this.maybeBinary(this.parseAtom())
  );

  parseAtom = (): AST => this.maybeCall(
    () => {
      if (this.is('(', 'Punctuation')) {
        this.next();
        const expression = this.parseExpression();
        this.skip(')', 'Punctuation');
        return expression;
      }

      if (this.is('{', 'Punctuation')) {
        return this.parseProgram();
      }
      if (this.is('if', 'Keyword')) {
        return this.parseCondition();
      }
      if (this.is('true', 'Keyword') || this.is('false', 'Keyword')) {
        return this.parseBoolean();
      }
      if (this.is('def', 'Keyword')) {
        this.next();
        return this.parseLambda();
      }

      const token = this.next();
      if (['Variable', 'Number', 'String'].includes(token.type)) {
        return token;
      }

      const unexpected = JSON.stringify(this.input.peek());
      const error = this.input.error(`Unexpected token: ${unexpected}`);

      throw error;
    }
  );

  parseBoolean(): BooleanNode {
    const { value } = this.next();
    return {
      type: 'Boolean',
      value: value === 'true',
    };
  }

  parseCall(ast: AST): AST {
    return {
      type: 'Call',
      function: ast,
      arguments: this.parseDelimited(
        this.parseExpression, {
          start: '(',
          stop: ')',
          separator: ',',
        },
      ),
    };
  }

  maybeCall = (parse: () => AST): AST => {
    const ast = parse();
    return this.is('(', 'Punctuation') ?
      this.parseCall(ast) :
      ast;
  }

  maybeBinary(lhs: AST, lhsPrecedence: number = 0): AST {
    if (!this.isOperator()) return lhs;

    const { value } = ((this.input.peek(): any): Token);
    const rhsPrecedence = Parser.precedence[value];
    if (rhsPrecedence > lhsPrecedence) {
      this.input.next();

      const operator = value.toString();
      const lhsNext = this.parseAtom();
      const rhs = this.maybeBinary(lhsNext, rhsPrecedence);

      const ast = value === '=' ?
        { type: 'Assignment', lhs, rhs } :
        { type: 'Binary', operator, lhs, rhs };

      return this.maybeBinary(ast, lhsPrecedence);
    }

    return lhs;
  }

  skip(value: string, type: TokenType) {
    if (this.is(value, type)) {
      this.next();
    } else {
      throw this.input.error(`Expecting ${type}: "${value}"`);
    }
  }

  is(value: string, type: TokenType): boolean {
    const token = this.input.peek();
    return token != null &&
      token.type === type &&
      token.value === value;
  }

  isOperator(): boolean {
    const token = this.input.peek();
    return token != null && token.type === 'Operator';
  }

  next<T : Token | AST>(): T {
    return ((this.input.next(): any): T);
  }
}
