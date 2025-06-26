
import React from "react";
import { createContext, useContext, useState } from "react";

// Create a context
export const UserDataContext = createContext({});

export const useUserDataRangeContext = () => useContext(UserDataContext);

// Create a provider component to wrap your application
export const UserDataRangeProvider = ({ children }: any) => {
  const [userRoleData, setUserRoleData] = useState<string[]>([]);
  const [applicationData, setApplicationData] = useState<string[]>([]);
  const [selectedApplicationIds, setSelectedApplicationIds] = useState<
    string[]
  >([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [getApplicationData, setGetApplicationData] = useState<string[]>([]);
  const [getNewApplicationData, setGetNewApplicationData] = useState<string[]>(
    []
  );
  const [options, setOptions] = React.useState<string[]>([]);
  const [selectedProject, setSelectedProject] = React.useState("");
  const [nameInput, setNameInput] = React.useState<string[]>([]);
  const [mailInput, setMailInput] = React.useState<string[]>([]);
  const [RoleData, setRoleData] = React.useState<string[]>([]);
  const [roleOptions, setRoleOptions] = React.useState<string[]>([]);
  const [selectedProjectId, setSelectedProjectId] = React.useState<string>("");
  return (
    <UserDataContext.Provider
      value={{
        getNewApplicationData,
        setGetNewApplicationData,
        roleOptions,
        setRoleOptions,
        RoleData,
        setRoleData,
        mailInput,
        setMailInput,
        nameInput,
        setNameInput,
        userRoleData,
        setUserRoleData,
        selectedProjectIds,
        setSelectedProjectIds,
        selectedProject,
        setSelectedProject,
        selectedProjectId,
        setSelectedProjectId,
        options,
        setOptions,
        getApplicationData,
        setGetApplicationData,
        selectedApplicationIds,
        setSelectedApplicationIds,
        applicationData,
        setApplicationData,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};
