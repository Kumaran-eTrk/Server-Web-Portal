import * as React from "react";
import {
  Combobox,
  makeStyles,
  Option,
  shorthands,
  useId,
} from "@fluentui/react-components";
import type { ComboboxProps } from "@fluentui/react-components";
import { useUserDataRangeContext } from "../../../../../contexts/user-data-context";
import { toast } from "react-toastify";

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

export const ProjectComboBox = (props: Partial<ComboboxProps>) => {
  const comboId = useId("combo-multi");
  const{  setSelectedProjectIds,selectedProjectIds}:any = useUserDataRangeContext();
  const [selectedOptions, setSelectedOptions] = React.useState<string[]>([]);
  const [value, setValue] = React.useState("");
  const [options, setOptions] = React.useState<string[]>([])
  const styles = useStyles();

  const onSelect: ComboboxProps["onOptionSelect"] = (_event, data) => {
    setSelectedOptions(data.selectedOptions);
    const selectedIds = options
      .filter((project: any) => data.selectedOptions.includes(project.projectName) && project.id !== undefined)
      .map((project: any) => project.id);
   
      setSelectedProjectIds(selectedIds); // Pass selected IDs instead of names
    setValue("");
  };
  
  React.useEffect(() => {
    const fetchProjectdata = async () => {
      try {
        const response = await api.get('/adminscreen/getprojects');
        const data = response.data;

        setOptions(data);
        
        
      
         
      } catch (error) {
        toast.error("Error fetching project data");
      }
    };

  fetchProjectdata();
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
        placeholder="Select a project"
        value={value}
        onBlur={onBlur}
        onChange={onChange}
        onFocus={onFocus}
        onOptionSelect={onSelect}
        {...props}
      >
        
        {options
          .sort((a: any, b: any) => a.projectName.localeCompare(b.projectName))
          .map((option: any) => (
            <Option key={option.id}>{option.projectName}</Option>// Pass ID as value
          ))}
      </Combobox>
    </div>
  );
};