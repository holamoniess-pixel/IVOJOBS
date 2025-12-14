const API = window.location.hostname.includes("localhost")
  ? "http://localhost:4000/api"
  : "https://YOUR-BACKEND-URL.onrender.com/api";

let token = localStorage.getItem("ivo_token");
let currentUser = null;

async function api(path, options = {}) {
  const res = await fetch(API + path, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : {"Content-Type":"application/json"}),
      ...(token ? {Authorization:`Bearer ${token}`} : {})
    }
  });
  if(!res.ok) throw new Error("API error");
  return res.status === 204 ? null : res.json();
}

function showNotification(msg,type="info"){
  alert(msg);
}
