import * as React from "react";
import {
  Combobox,
  makeStyles,
  Option,
  Checkbox,
  shorthands,
  useId,
} from "@fluentui/react-components";
import type { ComboboxProps } from "@fluentui/react-components";
import { useUserDataRangeContext } from "../../../../../contexts/user-data-context";
import api from "../../../../../interceptors";

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

export const ApplicationComboBox = (props: Partial<ComboboxProps>) => {
  const comboId = useId("combo-multi");
  const { setApplicationData, setSelectedApplicationIds }: any =
    useUserDataRangeContext();
  const [selectedOptions, setSelectedOptions] = React.useState<string[]>([]);
  const comboboxInputRef = React.useRef<HTMLInputElement>(null);
  const [value, setValue] = React.useState("");
  const [options, setOptions] = React.useState<string[]>([]);
  const [selectAll, setSelectAll] = React.useState(false);

  const styles = useStyles();

  const onSelect: ComboboxProps["onOptionSelect"] = (_event, data) => {
    // update selectedOptions
    setSelectedOptions(data.selectedOptions);

    const selectedIds = options
      .filter(
        (application: any) =>
          data.selectedOptions.includes(application.alternativeName) &&
          application.id !== undefined
      )
      .map((application: any) => application.id);
    setSelectedApplicationIds(selectedIds);

    // reset value to an empty string after selection
    setValue("");
  };

  const handleSelectAllChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const checked = event.currentTarget.checked || false;
    setSelectAll(checked);

    if (checked) {
      // Select all options
      const allAlternativeNames = options.map(
        (option: any) => option.alternativeName
      );
      setSelectedOptions(allAlternativeNames);

      const allIds = options
        .filter((option: any) => option.id !== undefined)
        .map((option: any) => option.id);
      setSelectedApplicationIds(allIds);
    } else {
      setSelectedOptions([]);
      setSelectedApplicationIds([]);
    }
  };

  React.useEffect(() => {
    const fetchApplicationdata = async () => {
      try {
        const response = await api.get("/adminscreen/getapplications");
        const data = response.data;
        setOptions(data);
        if (Array.isArray(data)) {
          setApplicationData(
            data.map((option, _index): any => ({
              userId: option.userId,
              User: option,
              userNames: option.userName,
              displayName: option.displayName,
              jobTitle: option.jobTitle,
              domains: option.domainName,
              email: option.email,
            }))
          );
        } else {
          console.error("Invalid API response format.");
        }
      } catch (error) {
        console.error("Error fetching application data:", error);
      }
    };

    fetchApplicationdata();
  }, []);

  // clear value on focus
  const onFocus = () => {
    setValue("");
  };

  // update value to selected options on blur
  const onBlur = () => {
    setValue(selectedOptions.join(", "));
  };

  // update value on input change
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  return (
    <div className={styles.root}>
      <Combobox
        aria-labelledby={comboId}
        multiselect={true}
        placeholder="Select an application"
        value={value}
        onBlur={onBlur}
        onChange={onChange}
        onFocus={onFocus}
        onOptionSelect={onSelect}
        selectedOptions={Array.isArray(selectedOptions) ? selectedOptions : []}
        ref={comboboxInputRef}
        {...props}
      >
        <Checkbox
          label="Select All"
          checked={selectAll}
          onChange={handleSelectAllChange}
        />
        {options
          .sort((a: any, b: any) =>
            a.alternativeName.localeCompare(b.alternativeName)
          )
          .map((option: any, _index) => (
            <Option key={option.id}>{option.alternativeName}</Option>
          ))}
      </Combobox>
    </div>
  );
};
