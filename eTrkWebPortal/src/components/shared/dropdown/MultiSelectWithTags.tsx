import * as React from "react";
import {
  Button,
  Checkbox,
  Combobox,
  makeStyles,
  Option,
  Persona,
  shorthands,
  tokens,
  Tooltip,
  useId,
} from "@fluentui/react-components";
import type { ComboboxProps } from "@fluentui/react-components";
import { Search20Regular } from "@fluentui/react-icons";
import { useRangeContext } from "../../contexts/range-context";
import api from "../../interceptors";

const useStyles = makeStyles({
  root: {
    // Stack the label above the field with a gap
    display: "grid",
    gridTemplateRows: "repeat(1fr)",
    justifyItems: "start",
    ...shorthands.gap("2px"),
    maxWidth: "50px",
  },
  tagsList: {
    listStyleType: "none",
    marginBottom: tokens.spacingVerticalXXS,
    marginTop: 0,
    paddingLeft: 0,
    display: "flex",
    gridGap: tokens.spacingHorizontalXXS,
  },
  listbox: {
    maxHeight: "400px",
  },
});

interface User {
  userId: string;
  email: string;
  userName: string;
  domainName: string;
  jobTitle: string;
  displayName: string;
  User: string;
}

export const MultiselectWithTags = (props: Partial<ComboboxProps>) => {
  const comboId = useId("combo-multi");
  const selectedListId = `${comboId}-selection`;
  const comboboxInputRef = React.useRef<HTMLInputElement>(null);
  const styles = useStyles();
  const [Users, setUsers] = React.useState<User[]>([]);
  const [selectAll, setSelectAll] = React.useState(false);
  const {
    selectedLocation,
    selectedDivision,
    selectedProject,
    selectedOptions,
    setSelectedOptions,
    setSelectedEmployee,
    selecteduserid,
    setSelectedUserId,
    selectedEmployee,
  }: any = useRangeContext();

  const onSelect: ComboboxProps["onOptionSelect"] = (_event, data) => {
    const selectedOptions = Array.isArray(data.selectedOptions)
      ? data.selectedOptions
      : [];

    setSelectedOptions((prevSelectedOptions: any) => {
      const updatedSelectedOptions = [
        ...prevSelectedOptions,
        ...selectedOptions,
      ];

      return updatedSelectedOptions;
    });

    const selectedIds = Users.filter(
      (user) =>
        selectedOptions.includes(user.displayName) && user.email !== undefined
    ).map((user) => user.email);

    setSelectedUserId(selectedIds);

    if (selectedOptions.length === 0) {
      setSelectAll(false);
    }
  };

  const handleSelectAllChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const checked = event.currentTarget.checked || false;
    setSelectAll(checked);

    const allUserIds = Users.map((user) => user.email);
    setSelectedUserId(checked ? allUserIds : []);
    setSelectedOptions(checked ? Users.map((user) => user.displayName) : []);
  };

  const fetchData = async () => {
    try {
      const dataToPost = {
        location: selectedLocation.length > 0 ? selectedLocation[0] : "string",
        division: selectedDivision.length > 0 ? selectedDivision[0] : "string",
        project: selectedProject.length > 0 ? selectedProject[0] : "string",
      };
      const response = await api.post("/adminscreen/userfilters", dataToPost);
      const { users }: any = response.data;

      if (Array.isArray(users)) {
        setUsers(
          users.map((option): any => ({
            email: option.email,
            User: option,
            userNames: option.userName,
            displayName: option.displayName,
            jobTitle: option.jobTitle,
            domains: option.domainName,
          }))
        );
      } else {
        console.error("Invalid API response format.");
      }
    } catch (err) {
      console.error("Dropdown API Error:", err);
    }
  };
  React.useEffect(() => {
    fetchData();
    setSelectedOptions([]);
  }, [selectedLocation, selectedDivision, selectedProject]);

  const labelledBy =
    selectedOptions.length > 0 ? `${comboId} ${selectedListId}` : comboId;

  const searchRecord = () => {
    setSelectedEmployee(selecteduserid);
  };

  return (
    <>
      <div className={styles.root}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "2px",
          }}
        >
          <Combobox
            aria-labelledby={labelledBy}
            multiselect={true}
            style={{ padding: "8px" }}
            placeholder={
              selectedEmployee.length > 0
                ? selectedEmployee
                : "Select the Employee "
            }
            selectedOptions={
              Array.isArray(selectedOptions) ? selectedOptions : []
            }
            onOptionSelect={onSelect}
            ref={comboboxInputRef}
            listbox={{ className: styles.listbox }}
            {...props}
          >
            <Checkbox
              label="Select All"
              checked={selectAll}
              onChange={handleSelectAllChange}
            />
            {[...Users]
              .sort((a, b) => a.displayName.localeCompare(b.displayName))
              .map((user) => (
                <Option
                  key={user.email}
                  text={user.displayName}
                  style={{ textOverflow: "ellipsis" }}
                >
                  <Persona
                    avatar={{ color: "colorful", "aria-hidden": true }}
                    name={user.displayName}
                    secondaryText={user.jobTitle}
                  />
                </Option>
              ))}
          </Combobox>
          <Tooltip content="search" relationship="label">
            <Button
              appearance="primary"
              size="large"
              style={{ backgroundColor: "#26C0BB", margin: "5px" }}
              icon={<Search20Regular />}
              onClick={searchRecord}
            />
          </Tooltip>
        </div>
      </div>
    </>
  );
};
