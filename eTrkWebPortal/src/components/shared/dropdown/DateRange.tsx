import { useEffect, useState } from 'react';
import { formatCustomEndDate, formatCustomStartDate } from '../../lib/Date-Utils';

interface DateRange {
  startDate: Date | string ;
  endDate: Date | string ;
}

const useDateRange = (initialDate: Date) => {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: initialDate,
    endDate: initialDate,
  });
  const [startdate, setStartDate] = useState<Date | null | undefined>(initialDate);
  const [enddate, setEndDate] = useState<Date | null | undefined>(initialDate);

  const maxDate = initialDate;

  const onSelectDate = (
    date: Date | null | undefined,
    setValueFn: React.Dispatch<React.SetStateAction<Date | null | undefined>>
  ) => {
    const formattedStartDate = formatCustomStartDate(date);
    setValueFn(date);
  };

  const onSelectDate1 = (
    date: Date | null| undefined,
    setValueFn: React.Dispatch<React.SetStateAction<Date | null |undefined>>
  ) => {
    const formattedEndDate = formatCustomEndDate(date);
    setValueFn(date);
  };


  

  const handleSearchClick = () => {
    const formattedStartDate = formatCustomStartDate(startdate);
    const formattedEndDate = formatCustomEndDate(enddate);

    setDateRange({
      startDate: formattedStartDate,
      endDate: formattedEndDate,
    });
  };

  const formattedStartDate = dateRange.startDate ? formatCustomStartDate(dateRange.startDate) : "";
  const formattedEndDate = dateRange.endDate ? formatCustomEndDate(dateRange.endDate) : "";

  return {
    startdate,
    enddate,
    maxDate,
    setStartDate,
    setEndDate,
    onSelectDate,
    onSelectDate1,
    handleSearchClick,
    dateRange,
    formattedStartDate,
    formattedEndDate,
  };
};

export default useDateRange;