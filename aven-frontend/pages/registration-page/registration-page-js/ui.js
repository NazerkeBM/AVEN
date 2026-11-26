import {
  submitBtn,
  googleBtn
} from "./dom.js";

export function setLoading(isLoading) {

  submitBtn.classList.toggle("is-loading", isLoading);

  submitBtn.disabled = isLoading;
  googleBtn.disabled = isLoading;

}