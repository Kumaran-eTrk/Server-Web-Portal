import * as React from 'react';
import { ComboBox,  IComboBox, IComboBoxOption } from '@fluentui/react';
import api from '../../interceptors';

interface IRole {
  roleId: number;
  roleName: string;
}

interface IMultiSelectDropdownProps {
  selectedRoles: number[];
  onChange: (selectedRoles: number[]) => void;
}


const MultiSelectDropdown: React.FC<IMultiSelectDropdownProps> = ({ selectedRoles, onChange }) => {
    const [roles, setRoles] = React.useState<IRole[]>([]);
   
 
    React.useEffect(() => {
      fetchRoles();
    }, []);

    const fetchRoles = async () => {
      try {
        const response = await api.get('/adminscreen/roles'); // Change the endpoint as per your API
        if (response.data && response.data.length > 0) {
          setRoles(response.data);
        } else {
          console.error('Failed to fetch roles data or roles data is empty');
        }
      } catch (error) {
        console.error('Error fetching roles data:', error);
      }
    };
   
    const comboBoxOptions: IComboBoxOption[] = roles.map(role => ({
      key: role.roleId.toString(),
      text: role.roleName,
      selected: selectedRoles.includes(role.roleId),
    }));
   
    const handleChange = (_event: React.FormEvent<IComboBox>, option?: IComboBoxOption): void => {
        if (option) {
          const updatedOptions = comboBoxOptions.map((currentOption) => {
            if (currentOption.key === option.key) {
              return {
                ...currentOption,
                selected: !currentOption.selected, // Toggle selected state
              };
            }
            return currentOption;
          });
          const selectedRoleIds = updatedOptions
            .filter((currentOption) => currentOption.selected)
            .map((currentOption) => parseInt(currentOption.key.toString()));
          onChange(selectedRoleIds); // Update selectedRoles state in the parent component
        }
      };
   
    return (
  <ComboBox
        placeholder="Select roles"
        label="Roles"
        multiSelect
        options={comboBoxOptions}
        onChange={handleChange}
      />
    );
  };

export default MultiSelectDropdown;
