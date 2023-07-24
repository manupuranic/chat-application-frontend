const baseUrl = "http://localhost:3000";
const form = document.getElementById("send-message");
const token = localStorage.getItem("token");
const profile = document.getElementById("profile");
const tableBody = document.getElementById("table-body");
const logout = document.getElementById("logout");
const newGroup = document.getElementById("newgroup");
const groupList = document.getElementById("group-list");
const menuBtn = document.getElementById("menu-btn");

logout.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("currentGpId");
  localStorage.removeItem("newGroupId");
  window.location.href = "./login/login.html";
});

newGroup.addEventListener("click", () => {
  window.location.href = "./newgroup/new-group.html";
});

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

const openGroupChat = (e) => {
  const gpId = e.target.id;
  const gpName = e.target.innerText;
  localStorage.setItem("currentGpId", gpId);
  localStorage.setItem("currentGpName", gpName);
  profile.replaceChildren();
  profile.appendChild(document.createTextNode(gpName));
  localStorage.setItem("messages", JSON.stringify([]));
  getChats();
  menuBtn.click();
};

const displayGroups = (group) => {
  const li = document.createElement("li");
  li.className = "list-group-item users";
  li.id = group.id;
  li.appendChild(document.createTextNode(group.name));
  li.addEventListener("click", openGroupChat);
  groupList.appendChild(li);
};

const getGroups = async () => {
  try {
    const response = await axios.get(`${baseUrl}/groups`, {
      headers: { Authentication: token },
    });
    const groups = response.data.groups;
    groups.forEach((group) => {
      displayGroups(group);
    });
  } catch (error) {}
};

const getChats = async () => {
  tableBody.replaceChildren();
  const gpId = localStorage.getItem("currentGpId");
  if (gpId) {
    let localMessages = JSON.parse(localStorage.getItem("messages"));
    const lastMsgId = localMessages.length
      ? localMessages[localMessages.length - 1].id
      : -1;
    try {
      const response = await axios.get(
        `${baseUrl}/chat?lastMsgId=${lastMsgId}&gpId=${gpId}`,
        {
          headers: { Authentication: token },
        }
      );
      const chats = response.data.chats;
      if (localMessages) {
        localMessages = [...localMessages, ...chats];
      } else {
        localMessages = [...chats];
      }
      if (localMessages.length) {
        localMessages.forEach((chat) => {
          displayChats(chat);
        });
        while (localMessages.length > 10) {
          localMessages.shift();
        }
        localStorage.setItem("messages", JSON.stringify(localMessages));
      } else {
        tableBody.innerHTML = `
    <tr><td><h3 style="text-align: center">No Messages</h3></td></tr>`;
      }
    } catch (err) {
      console.log(err);
    }
  } else {
    tableBody.innerHTML = `
    <tr><td><h1 class='heading'>Mchat App</h1></td></tr>
    <tr><td><h3 style="text-align: center">No group selected</h3></td></tr>`;
  }
};

const onLoad = () => {
  const gpName = localStorage.getItem("currentGpName");
  profile.replaceChildren();
  if (gpName) {
    profile.appendChild(document.createTextNode(gpName));
  }
  getChats();
  getGroups();
};

window.addEventListener("DOMContentLoaded", onLoad);

const submitHandler = async (e) => {
  e.preventDefault();
  const gpId = localStorage.getItem("currentGpId");
  const msg = e.target.message;
  const postMessage = {
    msg: msg.value,
  };
  try {
    const response = await axios.post(
      `${baseUrl}/chat?gpId=${gpId}`,
      postMessage,
      {
        headers: { Authentication: token },
      }
    );
    console.log(response.data);
    msg.value = "";
  } catch (err) {
    console.log(err);
  }
};

form.addEventListener("submit", submitHandler);

setInterval(getChats, 1000);
