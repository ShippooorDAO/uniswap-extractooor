import { ApolloClient, DocumentNode, gql, NormalizedCacheObject, OperationVariables, TypedDocumentNode } from "@apollo/client";
import { BigNumber } from "ethers";
import { USD_INTERNAL_DECIMALS } from "../Constants";
import { Token } from "../Currency/Token";
import { TokenAmount } from "../Currency/TokenAmount";
import { UsdAmount } from "../Currency/UsdAmount";
import { BaseEntity, BatchQueryResponse } from '../UniswapV3Subgraph/UniswapV3Subgraph.type';

/**
 * Uses the recommended more performant batch query method here:
 * https://thegraph.com/docs/en/developer/graphql-api#pagination
 *
 * The $id should be used as filter so that it hits the underlying index and we get
    * a faster query. Need to save the largest ID per query. Queries need to have the variable
    * $lastID in order to work with this method:
    *
    * queryi
    * {
    *    query allAccounts($lastID: String) {
    *      batch: accounts(
    *          first: $pageSize,
    *          where: { id_gt: $lastID },
    *          orderBy: id, orderDirection: asc
    *      ) {
    *        id
    *        owner
    *      }
    *    }
    *  }
 * @param apolloClient 
 */
export async function batchQuery<
    TData extends BaseEntity,
    TVariables = OperationVariables>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  apolloClient: ApolloClient<NormalizedCacheObject>,
  variables?: TVariables,
  pageSize = 1000
): Promise<TData[]> {
  let hasMoreResults = false;
  let lastID = '0';
  const batchResult: TData[] = [];

  do {
    try {
      const results = await apolloClient.query<BatchQueryResponse<TData>>({
        query,
        variables: {
          ...variables,
          pageSize,
          lastID,
      },
      });
      const dataList: TData[] = results.data.batch ?? [];
      batchResult.push(...dataList);

      hasMoreResults = dataList.length > 0;
      if (hasMoreResults) {
        lastID = dataList.at(-1)!.id;
      }
    } catch (e: unknown) {
      continue;
    }
  } while (hasMoreResults);

  return batchResult;
}

  /**
   * Builds a query compatible with `batchQuery`
   * @param objectName
   * @param queryBody
   * @returns DocumentNode
   */
  export function makeBatchQuery(objectName: string, queryBody: string): DocumentNode {
    return gql`
      query batchQuery($pageSize: Int!, $lastID: String) {
        batch: ${objectName}(
          first: $pageSize,
          where: { id_gt: $lastID },
          orderBy: id, orderDirection: asc
        ) ${queryBody}
      }
    `;
  }

  /**
   * Parses a BigDecimal value coming from subgraph into BigNumber
   * @param value Serialized big decimal
   * @param decimals Decimal precision of the BigNumber instance
   * @returns 
   */
  export function parseBigDecimalToBigNumber(value: string, decimals: number) {
    const [intPart, decimalPart] = value.split('.');
    let str: string;

    if (!intPart && !decimalPart) {
        return null;
    } else if (!decimalPart) {
        const padding = [];
        for (let i = 0; i < decimals; i += 1) {
            padding.push('0');
        }
        str = `${intPart}${padding.join('')}`;
    } else if (!intPart || intPart.length === 0 || intPart === '0') {
        str = `${decimalPart.slice(0, decimals).padEnd(decimals, '0')}`;
    } else {
        str = `${intPart}${decimalPart}`.slice(0, 18);
    }
    return BigNumber.from(str);
  }

  /**
   * Parses a BigDecimal value coming from a subgraph response to a TokenAmount.
   * 
   * BigDecimal has to be formatted as such, with no shift in decimals:
   *
   * 0.000004241424242142
   * 
   * @param value Serialized BigDecimal
   * @param token Token to convert into
   * @returns 
   */
  export function parseBigDecimalTokenAmount(value: string, token: Token): TokenAmount | null {
    const parsed = parseBigDecimalToBigNumber(value, token.decimals);
    return parsed ? new TokenAmount(parsed, token) : null;
  }

/**
   * Parses a BigDecimal value coming from a subgraph response to a UsdAmount.
   * 
   * BigDecimal has to be formatted as such, with no shift in decimals:
   *
   * 0.000004241424242142
   * 
   * @param value Serialized BigDecimal
   * @returns 
   */
  export function parseBigDecimalUsdAmount(value: string): UsdAmount | null {
    const parsed = parseBigDecimalToBigNumber(value, USD_INTERNAL_DECIMALS);
    return parsed ? new UsdAmount(parsed) : null;
  }
