// @ts-ignore
import numberAbbreviate from 'number-abbreviate';
import { BigNumber, utils } from 'ethers';

const bigNumberDecimalPlaces = 18;

export function getAccountShorthand(account: string) {
  return `${account.substring(0, 6)}...${account.substring(38,42)}`
}

function toExactString(n: BigNumber) {
    return utils.formatUnits(n, bigNumberDecimalPlaces);
}

function toDisplayString(n: BigNumber) {
    const exactString = toExactString(n);
    const displayString = parseFloat(exactString).toLocaleString('en-US', {
      minimumFractionDigits: bigNumberDecimalPlaces,
      maximumFractionDigits: bigNumberDecimalPlaces,
    });

    // If the return string is -0.00 or some variant, strip the negative
    if (displayString.match(/-0\.?[0]*/)) {
      return displayString.replace('-', '');
    }

    return displayString;
}

type Options = {
  abbreviate?: boolean;
  symbol?: string;
  decimals?: number;
  delta?: boolean;
};

export function formatDelta(delta?: number, symbol?: string) {
  if (!delta) {
    return '-';
  }
  const plusOrMinus = delta > 0 ? '+' : '';
  return `${plusOrMinus}${format(delta, { symbol })}`;
}

export function format(
  value?: number | string | BigNumber ,
  { symbol, decimals, abbreviate }: Options = { decimals: 2 }
): string {
  if (value === undefined) {
    return '-';
  }
  if (decimals === undefined) {
    decimals = 2;
  }
  if (value < 1000 && abbreviate) {
    decimals = 0;
  }
  if (typeof value === 'string') {
    value = Number(value);
  }

  if (abbreviate && value instanceof BigNumber) {
    value = Number(toExactString(value));
  }

  if (symbol === 'USD') {
    if (abbreviate && value >= 1000) {
      return `$${numberAbbreviate(value, decimals)}`;
    }
    if (value instanceof BigNumber) {
      return `$${toDisplayString(value)}`;
    }
    return value.toLocaleString(undefined, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
    });
  }
  if (symbol === '%') {
    if (value instanceof BigNumber) {
      value = Number(toExactString(value));
    }
    return `${(value * 100).toFixed(decimals)}%`;
  }

  let roundedLocalizedValue;
  if (abbreviate && value >= 1000) {
    roundedLocalizedValue = numberAbbreviate(value, decimals);
  } else if (value instanceof BigNumber) {
    roundedLocalizedValue = toDisplayString(value);
  } else {
    roundedLocalizedValue = value.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  if (symbol) {
    return `${roundedLocalizedValue} ${symbol}`;
  }
  return roundedLocalizedValue;
}
