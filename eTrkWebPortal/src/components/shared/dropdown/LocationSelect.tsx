import * as React from "react";
import {
  Button,
  Dropdown,
  makeStyles,
  Option,
  shorthands,
  tokens,
  useId,
} from "@fluentui/react-components";
import type { DropdownProps } from "@fluentui/react-components";
import api from "../../interceptors/index";
import { useRangeContext } from "../../contexts/range-context";
import { Dismiss12Regular } from "@fluentui/react-icons";
import { MultiselectWithTags } from "../../shared/dropdown/MultiSelectWithTags";

const useStyles = makeStyles({
  root: {
    // Stack the label above the field with a gap
    display: "grid",
    gridTemplateRows: "repeat(1fr)",
    justifyItems: "start",
    ...shorthands.gap("2px"),
    maxWidth: "100px",
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
interface User {
  userId: string;
  email: string;
  userName: string;
  domainName: string;
  jobTitle: string;
  displayName: string;
  User: string;
}

interface Location {
  id: string;
  locations: string;
}

interface Division {
  id: string;
  divisions: string;
}

interface Project {
  id: string;
  projects: string;
}

export const Locationselect = (props: Partial<DropdownProps>) => {
  const comboId = useId("combo-multi");
  const selectedListId = `${comboId}-selection`;

  const [locations, setLocations] = React.useState<Location[]>([]);
  const [divisions, setDivisions] = React.useState<Division[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [Users, setUsers] = React.useState<User[]>([]);

  const {
    selectedLocation,
    setSelectedLocation,
    selectedDivision,
    setSelectedDivision,
    selectedProject,
    setSelectedProject,
    setSelectedOptions,
    selecteduserid,
    setSelectedUserId,
    selectedEmployee,
  }: any = useRangeContext();

  const onTagClick = (_option: string, index: number) => {
    setSelectedUserId((prevSelectedUserId: any) => {
      const updatedUserId = prevSelectedUserId.filter(
        (_: any, i: any) => i !== index
      );
      return updatedUserId;
    });
  };

  React.useEffect(() => {
    const storedUserId = localStorage.getItem("selectedUserId");
    if (storedUserId) {
      setSelectedUserId(JSON.parse(storedUserId));
    }
  }, [setSelectedUserId]);

  // Save selectedUserId to local storage whenever it changes
  React.useEffect(() => {
    localStorage.setItem("selectedUserId", JSON.stringify(selecteduserid));
  }, [selecteduserid]);
  // Add useEffect to handle the logic after setSelectedUserId
  React.useEffect(() => {
    // Update selectedOptions based on the updated selectedUserId
    setSelectedOptions(() => {
      const updatedUserNames = Users.filter(
        (user) =>
          selecteduserid.includes(user.email) && user.email !== undefined
      ).map((user) => user.displayName);

      return updatedUserNames;
    });

    if (selecteduserid.length === 0) {
      // If no elements are left, clear selectedOptions or perform any necessary action
      setSelectedOptions([]);
    }
  }, [selecteduserid]);

  const styles = useStyles();

  const fetchData = async () => {
    try {
      const dataToPost = {
        location: selectedLocation.length > 0 ? selectedLocation[0] : "string",
        division: selectedDivision.length > 0 ? selectedDivision[0] : "string",
        project: selectedProject.length > 0 ? selectedProject[0] : "string",
      };
      const response = await api.post("/adminscreen/userfilters", dataToPost);

      const { locations, divisions, projects, users }: any = response.data;

      if (Array.isArray(locations)) {
        setLocations(
          locations.map((option, index) => ({
            id: index.toString(),
            locations: option,
          }))
        );
      } else {
        console.error("Invalid API response format.");
      }
      if (Array.isArray(projects)) {
        setProjects(
          projects.map((option, index) => ({
            id: index.toString(),
            projects: option,
          }))
        );
      } else {
        console.error("Invalid API response format.");
      }
      if (Array.isArray(divisions)) {
        setDivisions(
          divisions.map((option, index) => ({
            id: index.toString(),
            divisions: option,
          }))
        );
      } else {
        console.error("Invalid API response format.");
      }
      if (Array.isArray(users)) {
        setUsers(
          users.map((option): any => ({
            userId: option.userId,
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
    localStorage.setItem("selectedLocation", JSON.stringify(selectedLocation));
    localStorage.setItem("selectedDivision", JSON.stringify(selectedDivision));
    localStorage.setItem("selectedProject", JSON.stringify(selectedProject));
    localStorage.setItem("selectedEmployee", JSON.stringify(selectedEmployee));
  }, [selectedLocation, selectedDivision, selectedProject, selectedEmployee]);

  const selectedIds = Users.filter(
    (user) => selecteduserid.includes(user.email) && user.email !== undefined
  ).map((user) => user.displayName);

  return (
    <div>
      <div className="flex flex-wrap gap-6">
        <div>
          <Dropdown
            aria-labelledby={comboId}
            multiselect={false}
            style={{ padding: "8px" }}
            placeholder={
              selectedLocation.length > 0
                ? selectedLocation
                : "Select the Location"
            }
            selectedOptions={selectedLocation}
            onOptionSelect={(_event, data) => {
              const selectedKey = data.selectedOptions;
              if (selectedKey) {
                setSelectedLocation(selectedKey);
              } else {
                setSelectedLocation([]);
              }
            }}
            {...props}
          >
            {locations.map((option) => (
              <Option key={option.id}>{option.locations}</Option>
            ))}
          </Dropdown>
        </div>
        <div>
          <Dropdown
            aria-labelledby={comboId}
            multiselect={false}
            style={{ padding: "8px" }}
            placeholder={
              selectedDivision.length > 0
                ? selectedDivision
                : "Select the Division"
            }
            selectedOptions={selectedDivision}
            onOptionSelect={(_event, data) => {
              const selectedKey = data.selectedOptions;
              if (selectedKey[0] === selectedDivision[0]) return;
              if (selectedKey) {
                setSelectedDivision(selectedKey);
              } else {
                setSelectedDivision([]);
              }
            }}
            {...props}
          >
            {divisions.map((option) => (
              <Option key={option.id}>{option.divisions}</Option>
            ))}
          </Dropdown>
        </div>
        <div>
          <Dropdown
            aria-labelledby={comboId}
            multiselect={false}
            style={{ padding: "8px" }}
            placeholder={
              selectedProject.length > 0
                ? selectedProject
                : "Select the Project"
            }
            selectedOptions={selectedProject}
            onOptionSelect={(_event, data) => {
              const selectedKey = data.selectedOptions;
              if (selectedKey[0] === selectedProject[0]) return;
              if (selectedKey) {
                setSelectedProject(selectedKey);
              } else {
                setSelectedProject([]);
              }
            }}
            {...props}
          >
            {projects.map((option) => (
              <Option key={option.id}>{option.projects}</Option>
            ))}
          </Dropdown>
        </div>

        <div>
          <MultiselectWithTags />
          <div
            id="names"
            style={{
              marginTop: "4px",
              width: "350px",
              overflowX: "auto",
            }}
          >
            {selectedIds.length ? (
              <ul id={selectedListId} className={styles.tagsList}>
                <span id={`${comboId}-remove`} hidden>
                  Remove
                </span>
                {selectedIds.map((option: any, i: any) => (
                  <li key={option}>
                    <Button
                      size="small"
                      // shape="circular"
                      appearance="primary"
                      icon={<Dismiss12Regular />}
                      iconPosition="after"
                      onClick={() => onTagClick(option, i)}
                      id={`${comboId}-remove-${i}`}
                      aria-labelledby={`${comboId}-remove ${comboId}-remove-${i}`}
                      style={{ fontSize: "10px" }}
                    >
                      {option.split(" ")[0]}
                    </Button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
