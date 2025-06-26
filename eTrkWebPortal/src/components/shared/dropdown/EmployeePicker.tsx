import { useState, useEffect } from "react";
import api from "../../interceptors";

interface User {
  userid: string;
  email: string;
  userName: string;
  domainName: string;
  jobTitle: string;
  displayName: string;
}
const useFetchUsers = () => {
  const [users, setUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await api.get("/adminscreen/getusers");
      const { users } = response.data;

      if (Array.isArray(users)) {
        setUsers(
          users.map(
            (option, index): User => ({
              email: option.email,
              userid: option.userId,
              userName: option.userName,
              domainName: option.domainName,
              displayName: option.displayName,
              jobTitle: option.jobTitle,
            })
          )
        );
      } else {
        console.error("Invalid API response format.");
      }
    } catch (err) {
      console.error("Holiday User Dropdown API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { users, loading };
};

export default useFetchUsers;
