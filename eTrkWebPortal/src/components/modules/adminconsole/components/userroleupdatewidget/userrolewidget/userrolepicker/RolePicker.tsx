import * as React from "react";
import {
  Combobox,
  makeStyles,
  Option,
  shorthands,
  useId,
} from "@fluentui/react-components";
import type { ComboboxProps } from "@fluentui/react-components";
import api from "../../../../../../interceptors";
import { useUserDataRangeContext } from "../../../../../../contexts/user-data-context";

const useStyles = makeStyles({
  root: {
    // Stack the label above the field with a gap
    display: "grid",
    gridTemplateRows: "repeat(1fr)",
    justifyItems: "start",
    ...shorthands.gap("2px"),
    maxWidth: "50px",
  },
});

export const RolePicker = (props: Partial<ComboboxProps>) => {
  const comboId = useId("combo-multi");
  const [selectedOptions, setSelectedOptions] = React.useState<string[]>([]);
  const { setRoleOptions }: any = useUserDataRangeContext();
  const [value, setValue] = React.useState("");
  const [options, setOptions] = React.useState<string[]>([]);
  const styles = useStyles();
  const handleOptionClick = (_option: any) => {};
  const onSelect: ComboboxProps["onOptionSelect"] = (_event, data) => {
    setSelectedOptions(data.selectedOptions);

    const selectedIds = options
      .filter(
        (options: any) =>
          data.selectedOptions.includes(options.roleName) &&
          options.roleId !== undefined
      )
      .map((options: any) => options.roleId);
    setRoleOptions(selectedIds);
    setValue("");
  };

  React.useEffect(() => {
    const fetchrole = async () => {
      try {
        const response = await api.get("/adminscreen/roles");
        const data = response.data;

        setOptions(data);
      } catch (error) {
        console.error("Error fetching roles data:", error);
      }
    };

    fetchrole();
  }, []);

  const onFocus = () => {
    setValue("");
  };

  const onBlur = () => {
    setValue(selectedOptions.join(", "));
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  return (
    <div className={styles.root}>
      <Combobox
        aria-labelledby={comboId}
        multiselect={true}
        placeholder="Select a role"
        value={value}
        onBlur={onBlur}
        onChange={onChange}
        onFocus={onFocus}
        onOptionSelect={onSelect}
        required={selectedOptions.length === 0}
        {...props}
      >
        {options
          .sort((a: any, b: any) => a.roleName.localeCompare(b.roleName))
          .map((option: any, index) => (
            <Option
              key={index}
              onClick={() => handleOptionClick(option.roleId)}
            >
              {option.roleName}
            </Option>
          ))}
      </Combobox>
    </div>
  );
};
