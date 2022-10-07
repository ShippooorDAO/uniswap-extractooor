import { Token } from '@/shared/Currency/Token';
import {
  GridRenderCellParams,
  GridValueFormatterParams,
} from '@mui/x-data-grid-premium';
import { Badge } from 'react-daisyui';
import Blockies from 'react-blockies';
import { getAccountShorthand } from '@/shared/Utils/Format';
import { getIconForSymbol } from './Visuals';
import { CurrencyAmount } from '@/shared/Currency/CurrencyAmount';
import { TokenAmount } from '@/shared/Currency/TokenAmount';
import { UsdAmount } from '@/shared/Currency/UsdAmount';

export function PercentageGridValueFormatter(
  params: GridValueFormatterParams<number>
) {
  if (params.value == null) {
    return '';
  }

  const valueFormatted = Number(params.value * 100).toLocaleString();
  return `${valueFormatted} %`;
}

export function TokenRenderCell(params: GridRenderCellParams<Token>) {
  if (!params.value) {
    return 'Unknown';
  }
  const iconImageUri = getIconForSymbol(params.value.symbol.toLowerCase());
  if (iconImageUri) {
    return (
      <Badge className="badge-outline h-8">
        <img className="h-6 mr-3" src={iconImageUri} />
        <span>{params.value.symbol}</span>
      </Badge>
    );
  }
  return params.value.symbol;
}

export function AmountRenderCell(params: GridRenderCellParams<CurrencyAmount>) {
  if (!params.value) {
    return '';
  }
  return params.value.toDisplayString();
}

export function ExportAmountFormatter(
  params: GridValueFormatterParams<CurrencyAmount>
) {
  if (!params.value) {
    return '';
  }
  return params.value.toExactString();
}

export function TokenAmountWithUsdValueFormatter(
  params: GridValueFormatterParams<
    { amount: TokenAmount; timestamp?: number } | UsdAmount
  >
) {
  if (!params.value) {
    return '';
  }
  if (params.value instanceof UsdAmount) {
    return params.value.toDisplayString();
  }
  const { timestamp, amount } = params.value;
  return `${amount.toDisplayString()} (${
    amount?.toUsd(timestamp)?.toDisplayString() ?? ''
  })`;
}

export function WalletAddressRenderCell(params: GridRenderCellParams<string>) {
  if (!params.value) {
    return '';
  }
  return (
    <a href={`https://etherscan.io/address/${params.value}`} target="_blank">
      <div className="cursor-pointer">
        <Blockies
          className="m-3 ml-0 rounded-full inline"
          seed={params.value}
          size={10}
          scale={4}
        />
        <span>{getAccountShorthand(params.value)}</span>
      </div>
    </a>
  );
}

export function TransactionRenderCell(params: GridRenderCellParams<string>) {
  if (!params.value) {
    return '';
  }
  return (
    <a href={`https://etherscan.io/tx/${params.value}`} target="_blank">
      {getAccountShorthand(params.value)}
    </a>
  );
}

export function AddressRenderCell(params: GridRenderCellParams<string>) {
  if (!params.value) {
    return '';
  }
  return (
    <a href={`https://etherscan.io/address/${params.value}`} target="_blank">
      {getAccountShorthand(params.value)}
    </a>
  );
}

export function UniswapTokenRenderCell(params: GridRenderCellParams<string>) {
  if (!params.value) {
    return '';
  }
  return (
    <a
      href={`https://info.uniswap.org/#/tokens/${params.value}`}
      target="_blank"
    >
      {getAccountShorthand(params.value)}
    </a>
  );
}

export function UniswapPoolRenderCell(params: GridRenderCellParams<string>) {
  if (!params.value) {
    return '';
  }
  return (
    <a
      href={`https://info.uniswap.org/#/pools/${params.value}`}
      target="_blank"
    >
      {getAccountShorthand(params.value)}
    </a>
  );
}

export function AccountTagRenderCell(params: GridRenderCellParams<string>) {
  if (!params.value) {
    return '';
  }
  return <Badge className="badge-accent">{params.value}</Badge>;
}

export function DatetimeFormatter(params: GridValueFormatterParams<Date>) {
  return params.value.toLocaleString();
}
