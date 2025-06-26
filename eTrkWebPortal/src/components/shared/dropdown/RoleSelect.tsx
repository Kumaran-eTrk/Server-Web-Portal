/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Combobox, ComboboxProps, Persona, useId,  Option, makeStyles, shorthands, tokens,} from "@fluentui/react-components";
import api from "../../interceptors";
import { useRangeContext } from "../../contexts/range-context";
 
interface User {
  roleId:number,
  roleName:string
}
 
  const useStyles = makeStyles({
    root: {
      // Stack the label above the field with a gap
      display: "grid",
      gridTemplateRows: "repeat(1fr)",
      justifyItems: "start",
      ...shorthands.gap("2px"),
      Width: "50px",
      //maxHeight:'10px'
    },
    tagsList: {
      listStyleType: "none",
      marginBottom: tokens.spacingVerticalXXS,
      marginTop: 0,
      paddingLeft: 0,
      display: "flex",
      gridGap: tokens.spacingHorizontalXXS,
    },
  });
 
 
  export const RoleSelect = ({ onEmployeeChange,  props }: { onEmployeeChange: string;  props?: Partial<ComboboxProps> }) => {
  const styles = useStyles();
    const comboId = useId("combo-multi");
    const [Users, setUsers] = useState<User[]>([]);
    const [selectEmployee, setSelectEmployee] = useState<any[]>([]);
   
    const {  setUserRole}:any = useRangeContext();
    const fetchData = async () => {
        try {
          const response = await api.get('/adminscreen/roles');
          const users: User[] = response.data; // Assuming response.data is an array of User objects
      
          setUsers(users);
        } catch (err) {
          console.error("Error fetching roles:", err);
        }
      };
      
      React.useEffect(() => {
        fetchData();
      }, []);
      const onSelect: ComboboxProps['onOptionSelect'] = (_event, data) => {
        if (data.selectedOptions) {
          setSelectEmployee(data.selectedOptions);
          
          const selectedIds = Users
            .filter(user => data.selectedOptions.includes(user.roleName))
            .map(user => user.roleId);
          setUserRole(selectedIds);
        } else {
          setUserRole([]);
        }
      };
   
   

   
    
    return (
      <>
      <div className={styles.root}>
      
        {onEmployeeChange === "selectedRole" && (
         <Combobox
         aria-labelledby={comboId}
         placeholder="Select an employee"
         selectedOptions={selectEmployee}
         multiselect={true}  
         onOptionSelect={onSelect}
         // onOptionSelect={(event, data) => {
         //   const selectedKey = data.selectedOptions;
         //   if (selectedKey) {
         //     setEmployee3(selectedKey);
         //   } else {
         //     setEmployee3([]);
         //   }
         // }}
         {...props}
       >
         {[...Users]
            .sort((a, b) => a.roleName.localeCompare(b.roleName)).map((user: any) => (
            <Option key={user.roleName} text={user.roleName}>
              <Persona
                avatar={{ color: "colorful", "aria-hidden": true }}
                name={user.roleName}
               
              />
            </Option>
          ))}
        </Combobox>)}
    
      </div>
      {/* <div className={styles.root}>
        <Dropdown
        aria-labelledby={comboId}
        multiselect={false}
        placeholder="Select Employee"
        // size="medium"
        onOptionSelect={(event, data) => {
            const selectedKey = data.selectedOptions;
            if (selectedKey) {
            setEmployee(selectedKey);
            } else {
            setEmployee([]);
            }
        }}
        {...props}
        >
        {Users.map((user:any, index:any) => (
            <Option key={index.toString()} text={user.displayName} style={{textOverflow:'ellipsis'}} >
            <Persona
                avatar={{ color: "colorful", "aria-hidden": true }}
                name={user.displayName}
                secondaryText={user.jobTitle}
                //tertiaryText={user.jobTitle}
            />
            </Option>
        ))}
        </Dropdown>
      </div> */}
    </>
    );
  };