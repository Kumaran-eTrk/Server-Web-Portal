import React from "react";
import api from "../../interceptors";
import { useUserDataRangeContext } from "../../contexts/user-data-context";
import { Combobox, ComboboxProps, makeStyles, shorthands,Option } from "@fluentui/react-components";

const useStyles = makeStyles({
  root: {
  
    display: "grid",
    gridTemplateRows: "repeat(1fr)",
    justifyItems: "start",
    ...shorthands.gap("2px"),
    maxWidth: "50px",
  },
});

const ProjectDropdown = (props: Partial<ComboboxProps>) => {
  const{  setSelectedProjectId}:any = useUserDataRangeContext();
  const [selectedOptions, setSelectedOptions] = React.useState<string[]>(() => {
    const saved = localStorage.getItem("selectedProjectOption");
    return saved ? JSON.parse(saved) : [];
  });
  const [value, setValue] = React.useState("");
  const [options, setOptions] = React.useState<string[]>([])
  const styles = useStyles();

  const onSelect: ComboboxProps["onOptionSelect"] = (_event, data) => {
    setSelectedOptions(data.selectedOptions);
    const selectedIds = options
      .filter((project: any) => data.selectedOptions.includes(project.projectName) && project.id !== undefined)
      .map((project: any) => project.id);
   
      setSelectedProjectId(selectedIds);
     
      setValue(data.selectedOptions.join(", ")); 
  };
  
  React.useEffect(() => {
    const fetchProjectdata = async () => {
      try {
        const response = await api.get('/adminscreen/getprojects');
        const data = response.data;

        setOptions(data);
        
    
      } catch (error) {
        console.error("Error fetching project data:", error);
      }
    };

  fetchProjectdata();
  }, []);

  // clear value on focus
  const onFocus = () => {
    setValue("");
  };


  const onBlur = () => {
    setValue(selectedOptions.join(", "));
  };
  

  // update value on input change
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  React.useEffect(() => {
  
    localStorage.setItem(
      "selectedProjectOption",
      JSON.stringify(selectedOptions)
    );
   
  }, [selectedOptions]);



  return (
 

    <div className={styles.root}>
     <Combobox
         multiselect={false}
        placeholder={selectedOptions[0] || `select the project`}
        value={value}
        onBlur={onBlur}
        onChange={onChange}
        onFocus={onFocus}
        onOptionSelect={onSelect}
      
        {...props}
      >
        
        {options
          .sort((a: any, b: any) => a.projectName.localeCompare(b.projectName))
          .map((option: any,index:any) => (
            <Option key={index}>{option.projectName}</Option>// Pass ID as value
          ))}
      </Combobox>
    </div>
  );
};




export default ProjectDropdown;
