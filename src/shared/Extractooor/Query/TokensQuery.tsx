/* eslint-disable class-methods-use-this */

import { GridRowsProp, GridColDef } from '@mui/x-data-grid-pro';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { ExtractooorQueryBase } from './QueryBase';
import { UsdAmount } from '@/shared/Currency/UsdAmount';
import { TokenService } from '@/shared/Currency/TokenService';
import { TokenAmount } from '@/shared/Currency/TokenAmount';

interface Entity {
  id: string; // ID!
  symbol: string; // String!
  name: symbol; // String!
  decimals: string; // BigInt!
  totalSupply: string; // BigInt!
  volume: string; // BigDecimal!
  volumeUSD: string; // BigDecimal!
  untrackedVolumeUSD: string; // BigDecimal!
  feesUSD: string; // BigDecimal!
  txCount: string; // BigInt!
  poolCount: string; // BigInt!
  totalValueLocked: string; // BigDecimal!
  totalValueLockedUSD: string; // BigDecimal!
  totalValueLockedUSDUntracked: string; // BigDecimal!
  derivedETH: string; // BigDecimal!

  /**
   * Ignored repeated fields
   * whitelistPools: [Pool!]!
   * tokenDayData: [TokenDayData!]!
   */
}

interface Response {
  tokens: Entity[];
}

export default class TokensQuery extends ExtractooorQueryBase<
  Response,
  Entity
> {
  constructor(
    apolloClient: ApolloClient<NormalizedCacheObject>,
    tokenService: TokenService
  ) {
    super('Tokens', 'Tokens', apolloClient, tokenService);
  }

  getColumns(): GridColDef[] {
    return [
      {
        field: 'id',
        headerName: 'ID',
        ...this.baseFields.id,
      },
      {
        field: 'symbol',
        headerName: 'Symbol',
        ...this.baseFields.string,
      },
      {
        field: 'name',
        headerName: 'Name',
        type: 'string',
        width: 150,
        ...this.baseFields.string,
      },
      {
        field: 'decimals',
        headerName: 'Decimals',
        ...this.baseFields.integer,
      },
      {
        field: 'totalSupply',
        headerName: 'Total Supply',
        ...this.baseFields.amount,
      },
      {
        field: 'volume',
        headerName: 'Volume',
        ...this.baseFields.amount,
      },
      {
        field: 'volumeUSD',
        headerName: 'Volume USD',
        ...this.baseFields.amount,
      },
      {
        field: 'untrackedVolumeUSD',
        headerName: 'Untracked Volume USD',
        ...this.baseFields.amount,
      },
      {
        field: 'feesUSD',
        headerName: 'Fees USD',
        ...this.baseFields.amount,
      },
      {
        field: 'txCount',
        headerName: 'Tx Count',
        ...this.baseFields.integer,
      },
      {
        field: 'poolCount',
        headerName: 'Pool Count',
        ...this.baseFields.integer,
      },
      {
        field: 'totalValueLocked',
        headerName: 'Total Value Locked',
        ...this.baseFields.amount,
      },
      {
        field: 'totalValueLockedUSD',
        headerName: 'Total Value Locked (USD)',
        ...this.baseFields.amount,
      },
      {
        field: 'totalValueLockedUSDUntracked',
        headerName: 'Untracked Total Value Locked (USD)',
        ...this.baseFields.amount,
      },
      {
        field: 'derivedETH',
        headerName: 'Derived ETH',
        ...this.baseFields.amount,
      },
    ];
  }

  getQueryEntityName() {
    return 'tokens';
  }

  getQueryBody() {
    return `{
      id
      symbol
      name
      decimals
      totalSupply
      volume
      volumeUSD
      untrackedVolumeUSD
      feesUSD
      txCount
      poolCount
      totalValueLocked
      totalValueLockedUSD
      totalValueLockedUSDUntracked
      derivedETH
    }`;
  }

  getRows(response: Entity[]): GridRowsProp {
    const ethToken = this.tokenService.getBySymbol('ETH')!;
    return response.map((entry) => ({
      ...entry,
      decimals: Number(entry.decimals),
      totalSupply: TokenAmount.fromBigDecimal(
        entry.totalSupply,
        this.tokenService.getById(entry.id)!
      ),
      volume: TokenAmount.fromBigDecimal(
        entry.volume,
        this.tokenService.getById(entry.id)!
      ),
      volumeUSD: UsdAmount.fromBigDecimal(entry.volumeUSD),
      untrackedVolumeUSD: UsdAmount.fromBigDecimal(entry.untrackedVolumeUSD),
      feesUSD: UsdAmount.fromBigDecimal(entry.feesUSD),
      txCount: Number(entry.txCount),
      poolCount: Number(entry.poolCount),
      totalValueLocked: TokenAmount.fromBigDecimal(
        entry.totalValueLocked,
        this.tokenService.getById(entry.id)!
      ),
      totalValueLockedUSD: UsdAmount.fromBigDecimal(entry.totalValueLockedUSD),
      totalValueLockedUSDUntracked: UsdAmount.fromBigDecimal(
        entry.totalValueLockedUSDUntracked
      ),
      derivedETH: TokenAmount.fromBigDecimal(entry.derivedETH, ethToken),
    }));
  }
}
