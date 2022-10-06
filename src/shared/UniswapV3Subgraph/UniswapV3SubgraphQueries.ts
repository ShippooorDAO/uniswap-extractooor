import gql from "graphql-tag"

export const TOKENS_BATCH_QUERY = gql`
    query batchQuery($pageSize: Int!, $lastID: String) {
      batch: tokens(
        first: $pageSize,
        where: { id_gt: $lastID },
        orderBy: id, orderDirection: asc
      ){
        id
        symbol
        name
        decimals
      }
  }
`;

export const POOLS_BATCH_QUERY_BY_TIMESTAMP = gql`
  query batchQuery($pageSize: Int!, $createdAfterTimestamp: Int!) {
    batch: pools(
      first: $pageSize
      where: { createdAtTimestamp_gt: $createdAfterTimestamp }
      orderBy: createdAtTimestamp
      orderDirection: asc
    ) {
      id
      feeTier
      createdAtTimestamp
      token0 {
        id
        symbol
        name
        decimals
      }
      token1 {
        id
        symbol
        name
        decimals
      }
    }
  }
`;

export const POOLS_BATCH_QUERY_BY_ID = gql`
  query batchQuery($pageSize: Int!, $lastID: String) {
    batch: pools(
      first: $pageSize
      where: { id_gt: $lastID }
      orderBy: id
      orderDirection: asc
    ) {
      id
      feeTier
      createdAtTimestamp
      token0 {
        id
        symbol
        name
        decimals
      }
      token1 {
        id
        symbol
        name
        decimals
      }
    }
  }
`;
