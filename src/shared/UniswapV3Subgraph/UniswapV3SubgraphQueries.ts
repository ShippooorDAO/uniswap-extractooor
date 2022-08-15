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
