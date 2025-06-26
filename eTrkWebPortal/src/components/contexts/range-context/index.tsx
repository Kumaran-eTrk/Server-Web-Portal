
import React from "react";
import { createContext, useContext, useState } from "react";


export const ClaimsRangeContext = createContext({});

export const useRangeContext = () => useContext(ClaimsRangeContext);

export const ClaimsProvider = ({ children }: any) => {
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const [Domain, setDomain] = useState(localStorage.getItem("domain"));
  const [password, setPassword] = useState();
  const [tokenCredential, setTokenCredential] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string[]>(() => {
    const saved = localStorage.getItem("selectedLocation");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedDivision, setSelectedDivision] = useState<string[]>(() => {
    const saved = localStorage.getItem("selectedDivision");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedProject, setSelectedProject] = useState<string[]>(() => {
    const saved = localStorage.getItem("selectedProject");
    return saved ? JSON.parse(saved) : [];
  });
  const [searchClicked, setSearchClicked] = React.useState<boolean>(false);
  
  const [resetpopup, setResetPopup] = React.useState(false);
  const [otppopup, setOtpPopup] = React.useState(false);
  const [productkey, setProductKey] = useState(false);
  const [selectedOptions, setSelectedOptions] = React.useState<string[]>([]);
  const [role, setRole] = useState(localStorage.getItem("user_role"));
  const [selectedOptionss, setSelectedOptionss] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string[]>([]);
  const [division, setDivisions] = useState(localStorage.getItem("division"));
  const [userid, setUserId] = useState(localStorage.getItem("userid"));
  const [project, setProjects] = useState(localStorage.getItem("project"));
  const [selecteduserid, setSelectedUserId] = useState<string[]>([]);
  const [userdataPopup, setUserDataPopup] = useState(false);
  const [holidayPopup, setHolidayPopup] = useState(false);
  const [projectPopup, setProjectPopup] = useState(false);
  const [userRole, setUserRole] = useState<string[]>([]);
  const [timePickerValue, setTimePickerValue] = useState<string[]>([]);
  const [timePickerValue1, setTimePickerValue1] = useState<string[]>([]);
  const [timePickerValue2, setTimePickerValue2] = useState<string[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string[]>(() => {
    const saved = localStorage.getItem("selectedEmployee");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedUser, setSelectedUser] = useState({
    email: "",
    displayName: "",
  });

  return (
    <ClaimsRangeContext.Provider
      value={{
        selectedUser,
        setSelectedUser,
        userRole,
        setUserRole,
        role,
        setRole,
        projectPopup,
        setProjectPopup,
        holidayPopup,
        setHolidayPopup,
        userdataPopup,
        setUserDataPopup,
        timePickerValue,
        setTimePickerValue,
        timePickerValue1,
        setTimePickerValue1,
        timePickerValue2,
        setTimePickerValue2,
        searchClicked,
        setSearchClicked,
        selecteduserid,
        setSelectedUserId,
        division,
        setDivisions,
        userid,
        setUserId,
        project,
        setProjects,
        selectedOptionss,
        setSelectedOptionss,
        selectedOptions,
        setSelectedOptions,
        selectedDate,
        setSelectedDate,
        selectedLocation,
        setSelectedLocation,
        selectedDivision,
        setSelectedDivision,
        selectedProject,
        setSelectedProject,
        selectedEmployee,
        setSelectedEmployee,
        username,
        setUsername,
        password,
        setPassword,
        Domain,
        setDomain,
        tokenCredential,
        setTokenCredential,
        resetpopup,
        setResetPopup,
        otppopup,
        setOtpPopup,
        productkey,
        setProductKey,
      }}
    >
      {children}
    </ClaimsRangeContext.Provider>
  );
};
