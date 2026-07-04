import getCSRFToken from "./getCSRFToken.jsx";

async function postForm(url, formData) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "X-CSRFToken": getCSRFToken(),
    },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }

  return await res.json();
}

export default postForm;
