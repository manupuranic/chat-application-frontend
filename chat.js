const baseUrl = "http://localhost:3000";
const form = document.getElementById("send-message");
const token = localStorage.getItem("token");
const profile = document.getElementById("profile");
const tableBody = document.getElementById("table-body");

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

const displayChats = (chat) => {
  const { message } = chat;
  const currentUser = parseJwt(token);
  const trow = document.createElement("tr");
  if (currentUser.id === chat.userId) {
    trow.className = "right";
    trow.innerHTML = `<td></td>
                  <td>
                    <span class="you rounded shadow-sm">${message}</span>
                  </td>
    `;
  } else {
    trow.innerHTML = `<td>
                    <span class="others rounded shadow-sm">${chat.user.userName}: ${message}</span>
                  </td>
                  <td></td>
  `;
  }
  tableBody.appendChild(trow);
};

const getChats = async () => {
  try {
    const response = await axios.get(`${baseUrl}/chat`, {
      headers: { Authentication: token },
    });
    const chats = response.data.chats;
    chats.forEach((chat) => {
      displayChats(chat);
    });
  } catch (err) {
    console.log(err);
  }
};

const onLoad = () => {
  const userData = parseJwt(token);
  profile.appendChild(document.createTextNode(userData.userName));
  getChats();
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
