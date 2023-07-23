const baseUrl = "http://localhost:3000";
const form = document.getElementById("send-message");
const token = localStorage.getItem("token");
const profile = document.getElementById("profile");

if (!token) {
  window.location.href = "./login/login.html";
}

function parseJwt(token) {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
}

const onLoad = () => {
  const userData = parseJwt(token);
  profile.appendChild(document.createTextNode(userData.userName));
};

window.addEventListener("DOMContentLoaded", onLoad);

const submitHandler = async (e) => {
  e.preventDefault();
  const msg = e.target.message;
  const postMessage = {
    msg: msg.value,
  };
  try {
    const response = await axios.post(`${baseUrl}/chat`, postMessage, {
      headers: { Authentication: token },
    });
    console.log(response.data);
    msg.value = "";
  } catch (err) {
    console.log(err);
  }
};

form.addEventListener("submit", submitHandler);
