const getCSRFToken = () =>
  document.querySelector('meta[name="csrf-token"]').getAttribute("content");

export default getCSRFToken;
