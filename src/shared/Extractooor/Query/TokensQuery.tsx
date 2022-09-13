/* eslint-disable class-methods-use-this */

import { GridRowsProp, GridColDef } from '@mui/x-data-grid-pro';
import { ReactNode } from 'react';
import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client';
import { ExtractooorQueryBase } from './QueryBase';
import { UsdAmount } from '@/shared/Currency/UsdAmount';
import { AmountFormatter } from '@/shared/Utils/DataGrid';
import { TokenService } from '@/shared/Currency/TokenService';
import { TokenAmount } from '@/shared/Currency/TokenAmount';

interface Response {
  tokens: {
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
  }[];
}

const QUERY = gql`
  {
    tokens {
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
    }
  }
`;

export default class TokensQuery extends ExtractooorQueryBase {
  private readonly baseColumns: GridColDef[] = [
    { field: 'id', headerName: 'ID', type: 'string', width: 150 },
    { field: 'symbol', headerName: 'Symbol', type: 'string', width: 150 },
    { field: 'name', headerName: 'Name', type: 'string', width: 150 },
    { field: 'decimals', headerName: 'Decimals', type: 'number', width: 150 },
    {
      field: 'totalSupply',
      headerName: 'Total Supply',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'volume',
      headerName: 'Volume',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'volumeUSD',
      headerName: 'Volume USD',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'untrackedVolumeUSD',
      headerName: 'Untracked Volume USD',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'feesUSD',
      headerName: 'Fees USD',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'txCount',
      headerName: 'Tx Count',
      type: 'number',
      width: 150,
    },
    {
      field: 'poolCount',
      headerName: 'Pool Count',
      type: 'number',
      width: 150,
    },
    {
      field: 'totalValueLocked',
      headerName: 'Total Value Locked',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'totalValueLockedUSD',
      headerName: 'Total Value Locked (USD)',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'totalValueLockedUSDUntracked',
      headerName: 'Untracked Total Value Locked (USD)',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
    {
      field: 'derivedETH',
      headerName: 'Derived ETH',
      type: 'number',
      width: 150,
      valueFormatter: AmountFormatter,
    },
  ];

  constructor(
    private readonly apolloClient: ApolloClient<NormalizedCacheObject>,
    private readonly tokenService: TokenService
  ) {
    super('Tokens', 'Tokens');
  }

  private parseResponse(response: Response): GridRowsProp {
    const ethToken = this.tokenService.getBySymbol('ETH')!;
    return response.tokens.map((entry) => ({
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

  async fetch(): Promise<{ rows: GridRowsProp; columns: GridColDef[] }> {
    const response = await this.apolloClient.query<Response>({
      query: QUERY,
    });
    const rows = this.parseResponse(response.data);
    return { rows, columns: this.baseColumns };
  }

  form(): ReactNode {
    return <div />;
  }
}
