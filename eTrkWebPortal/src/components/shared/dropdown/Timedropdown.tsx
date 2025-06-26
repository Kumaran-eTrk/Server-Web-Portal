import { ComboboxProps, makeStyles } from "@fluentui/react-components";
import { TimePicker, TimePickerProps } from "@fluentui/react-timepicker-compat";
import { useRangeContext } from "../../contexts/range-context";

const useStyles = makeStyles({
  root: {
    maxWidth: "150px",
  },
});

export const TimeRange = ({
  onTimePickerChange,
  props,
}: {
  onTimePickerChange: string;
  props?: Partial<ComboboxProps>;
}) => {
  const styles = useStyles();

  const {
    timePickerValue,
    setTimePickerValue,
    timePickerValue1,
    setTimePickerValue1,
    timePickerValue2,
    setTimePickerValue2,
  }: any = useRangeContext();

  const onTimeChange: TimePickerProps["onTimeChange"] = (_ev, data) => {
    setTimePickerValue(data.selectedTimeText ?? "");
  };

  const onTimeChange1: TimePickerProps["onTimeChange"] = (_ev, data) => {
    setTimePickerValue1(data.selectedTimeText ?? "");
  };
  const onTimeChange2: TimePickerProps["onTimeChange"] = (_ev, data) => {
    setTimePickerValue2(data.selectedTimeText ?? "");
  };

  const formatDateToTimeString = (date: Date) => {
    const localeTimeString = date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hourCycle: "h24",
    });
    if (date.getHours() < 12) {
      return `${localeTimeString} AM`;
    }
    return `${localeTimeString} PM`;
  };

  return (
    <div className={styles.root}>
      <div
        style={{ display: "flex", justifyContent: "space-between", gap: "5px" }}
      >
        {onTimePickerChange == "timepicker1" && (
          <TimePicker
            onTimeChange={onTimeChange}
            placeholder="select the cut-off"
            {...props}
          />
        )}
        {onTimePickerChange == "timepicker2" && (
          <TimePicker
            onTimeChange={onTimeChange1}
            formatDateToTimeString={formatDateToTimeString}
            value={timePickerValue1}
            style={{ padding: "3px", height: "43px", minWidth: "230px" }}
            {...props}
          />
        )}
        {onTimePickerChange == "timepicker3" && (
          <TimePicker
            onTimeChange={onTimeChange2}
            formatDateToTimeString={formatDateToTimeString}
            value={timePickerValue2}
            style={{ padding: "3px", height: "43px", minWidth: "230px" }}
            {...props}
          />
        )}
      </div>
    </div>
  );
};
