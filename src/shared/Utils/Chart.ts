import moment from 'moment';

export function historicalChartXAxisTickFormatter(value: string) {
  return `    ${moment(value, 'X').format('MMM YYYY')}    `;
}
