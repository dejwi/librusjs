import axios from "axios";

const Librus = async (username: string, password: string) => {
  let isAuthorized = false;
  let token = "";

  const login = async () => {
    const res = await axios.post(
      "https://api.librus.pl/OAuth/Token",
      `username=${username}&password=${password}&librus_long_term_token=1&grant_type=password`,
      {
        headers: {
          Authorization:
            "Basic Mjg6ODRmZGQzYTg3YjAzZDNlYTZmZmU3NzdiNThiMzMyYjE=",
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    if (res.status !== 200) return false;

    isAuthorized = true;
    token = `Bearer ${res.data.access_token}`;
    return true;
  };

  const init = await login();
  if (!init) throw new Error("Failed to auth");
};

export default Librus;
