import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { naira } from './posRegisterExtras';

/**
 * On-screen number pad + calculator for cash tendering.
 *
 * Clean, big-touch-target keypad a cashier can drive with a finger or mouse:
 * digits append, `+ − × ÷` build a running expression that is evaluated live,
 * `C` clears, `⌫` deletes, `Exact` fills the amount due and `Enter` confirms.
 */
export function PosCalculatorKeypad({
  value,
  due,
  onChange,
  onConfirm,
}: {
  value: number;
  due: number;
  onChange: (value: number) => void;
  onConfirm?: () => void;
}) {
  const [expression, setExpression] = useState<string | null>(null);

  const evaluated = expression ? safeEval(expression) : null;

  const pushDigit = (digit: string) => {
    setExpression(null);
    const next = value === 0 && digit !== '0' ? digit : `${value}${digit}`;
    // Guard against absurd lengths from a stray held key.
    onChange(Math.min(Number(next.slice(0, 12) || '0'), 999999999));
  };

  const pushOperator = (op: string) => {
    // Seed the expression with the typed amount, then chain operators.
    const base = expression ?? String(value);
    if (/[+\-×÷]$/.test(base)) {
      setExpression(base.slice(0, -1) + op);
      return;
    }
    setExpression(`${base}${op}`);
  };

  const applyExpression = () => {
    if (!expression) return;
    const result = safeEval(expression);
    if (result !== null) {
      onChange(result);
      setExpression(null);
    }
  };

  const clearAll = () => {
    setExpression(null);
    onChange(0);
  };

  const backspace = () => {
    setExpression(null);
    onChange(Math.floor(value / 10));
  };

  const keys: Array<{ label: string; onPress: () => void; tone?: string; span?: boolean }> = [
    { label: '7', onPress: () => pushDigit('7') },
    { label: '8', onPress: () => pushDigit('8') },
    { label: '9', onPress: () => pushDigit('9') },
    { label: '÷', onPress: () => pushOperator('÷'), tone: 'bg-surface-subtle text-primary' },
    { label: '4', onPress: () => pushDigit('4') },
    { label: '5', onPress: () => pushDigit('5') },
    { label: '6', onPress: () => pushDigit('6') },
    { label: '×', onPress: () => pushOperator('×'), tone: 'bg-surface-subtle text-primary' },
    { label: '1', onPress: () => pushDigit('1') },
    { label: '2', onPress: () => pushDigit('2') },
    { label: '3', onPress: () => pushDigit('3') },
    { label: '−', onPress: () => pushOperator('−'), tone: 'bg-surface-subtle text-primary' },
    { label: '0', onPress: () => pushDigit('0') },
    { label: '.', onPress: () => pushDigit('0') },
    { label: '⌫', onPress: backspace, tone: 'bg-surface-subtle text-text-secondary' },
    { label: '+', onPress: () => pushOperator('+'), tone: 'bg-surface-subtle text-primary' },
  ];

  return (
    <div className="flex flex-col gap-space-sm">
      {/* Live display */}
      <div className="rounded-xl bg-surface-subtle p-space-sm flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="font-caption text-caption uppercase tracking-wider font-semibold text-text-secondary">
            Cash Received
          </span>
          <span className="font-caption text-caption text-text-tertiary">
            Due {naira(due)}
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-heading-lg text-heading-lg font-bold text-text-primary leading-none">
            {naira(value)}
          </span>
          {expression && (
            <span className="font-mono text-caption text-primary truncate">{expression} = {evaluated ?? '…'}</span>
          )}
        </div>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-4 gap-space-xs">
        {keys.map((key) => (
          <button
            key={key.label}
            type="button"
            onClick={key.onPress}
            className={`h-12 rounded-xl font-heading-sm text-heading-md font-semibold flex items-center justify-center transition-colors active:scale-95 ${
              key.tone ?? 'bg-surface hover:bg-surface-container-high text-text-primary'
            }`}
          >
            {key.label}
          </button>
        ))}
      </div>

      {/* Action row */}
      <div className="grid grid-cols-3 gap-space-xs">
        <button
          type="button"
          onClick={clearAll}
          className="h-11 rounded-xl bg-error-container text-error font-label-md text-label-md font-semibold flex items-center justify-center gap-1 hover:opacity-90 transition-opacity"
        >
          <Icon name="backspace" className="text-[16px]" />
          <span>Clear</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setExpression(null);
            onChange(due);
          }}
          className="h-11 rounded-xl bg-surface-subtle text-primary font-label-md text-label-md font-semibold flex items-center justify-center hover:bg-surface-container-high transition-colors"
        >
          Exact
        </button>
        <button
          type="button"
          onClick={applyExpression}
          disabled={!expression}
          className="h-11 rounded-xl bg-surface-tint-blue text-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-1 disabled:opacity-40 transition-opacity"
        >
          <Icon name="calculate" className="text-[16px]" />
          <span>Apply</span>
        </button>
      </div>

      {onConfirm && (
        <button
          type="button"
          onClick={onConfirm}
          disabled={value < due}
          className="h-12 rounded-xl bg-primary text-on-primary font-button-secondary text-button-secondary font-bold flex items-center justify-center gap-2 shadow-sm disabled:opacity-40 transition-opacity"
        >
          <Icon name="done_all" className="text-[18px]" />
          <span>Tender {naira(value)}</span>
        </button>
      )}
    </div>
  );
}

/** Evaluate a simple `+ − × ÷` expression with correct precedence. Null on garbage. */
function safeEval(raw: string): number | null {
  const cleaned = raw.replace(/−/g, '-').replace(/×/g, '*').replace(/÷/g, '/');
  if (!/^[\d+\-*/.\s]+$/.test(cleaned)) return null;

  const tokens = cleaned.match(/\d+(?:\.\d+)?|[+\-*/]/g);
  if (!tokens || tokens.length < 3) return null;
  if (tokens.some((token) => /^[+\-*/]$/.test(token) === false && !Number.isFinite(Number(token)))) return null;

  // Shunting-yard → RPN, then evaluate. Handles precedence and left associativity.
  const precedence: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2 };
  const output: Array<string | number> = [];
  const ops: string[] = [];
  let previousType: 'num' | 'op' | null = null;

  for (const token of tokens) {
    if (/^\d/.test(token)) {
      output.push(Number(token));
      previousType = 'num';
    } else {
      // Unary minus: an operator (or nothing) before it means "negate".
      if (token === '-' && previousType !== 'num') {
        output.push(0);
      }
      while (ops.length && precedence[ops[ops.length - 1]] >= precedence[token]) {
        output.push(ops.pop() as string);
      }
      ops.push(token);
      previousType = 'op';
    }
  }
  while (ops.length) output.push(ops.pop() as string);

  const stack: number[] = [];
  for (const token of output) {
    if (typeof token === 'number') {
      stack.push(token);
      continue;
    }
    const b = stack.pop();
    const a = stack.pop();
    if (a === undefined || b === undefined) return null;
    if (token === '+') stack.push(a + b);
    else if (token === '-') stack.push(a - b);
    else if (token === '*') stack.push(a * b);
    else stack.push(b === 0 ? 0 : a / b);
  }

  const result = stack.pop();
  if (result === undefined || !Number.isFinite(result)) return null;
  return Math.max(0, Math.round(result));
}
