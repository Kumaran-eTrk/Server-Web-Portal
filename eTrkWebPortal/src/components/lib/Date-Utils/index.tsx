/* eslint-disable @typescript-eslint/no-explicit-any */
export function formatUtcDateToCustomFormat(utcDate:any) {
  const date = new Date(utcDate);
  const year = date.getUTCFullYear().toString(); // Get the last 2 digits of the year
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Month is zero-based, so add 1
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

export function formatCustomStartDate(utcDate:any) {
  const date = new Date(utcDate);
  const year = date.getFullYear().toString(); // Get the last 2 digits of the year
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-based, so add 1
  const day = String(date.getDate()).padStart(2, '0');
  const hours = '00';
  const minutes = '00';
  const seconds = '00';

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}


export function formatCustomEndDate(utcDate:any) {
  const date = new Date(utcDate);
  const year = date.getFullYear().toString(); // Get the last 2 digits of the year
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-based, so add 1
  const day = String(date.getDate()).padStart(2, '0');
  const hours = '23';
  const minutes = '59';
  const seconds = '59';

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

export const onFormatDate=(utcDate:any) => {
  const date = new Date(utcDate);
  const year = date.getFullYear().toString(); 
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-based, so add 1
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}