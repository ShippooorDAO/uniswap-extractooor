import {zip} from 'lodash';

export function calculateDelta(
  a: number = 0,
  b: number = 0
): number {
  return b - a;
}

export function calculateDeltaPercent(a: number = 0,
  b: number = 0) {
  return calculateDelta(a, b) / a;
}

export function calculateDatasetDelta<
  Dataset extends { [key: string]: number | undefined }
>(
  datasetA: Dataset,
  datasetB: Dataset
): { percent: Dataset; decimal: Dataset } {
  const zippedDatasets = zip(Array.from(Object.entries(datasetA)), Array.from(Object.entries(datasetB)));
  return {
    decimal: Object.fromEntries(
      zippedDatasets.map(([a, b]) => [a?.[0], calculateDelta(a?.[1], b?.[1])])
    ),
    percent: Object.fromEntries(
      zippedDatasets.map(([a, b]) => [
        a?.[0],
        calculateDeltaPercent(a?.[1], b?.[1]),
      ])
    ),
  };
}
