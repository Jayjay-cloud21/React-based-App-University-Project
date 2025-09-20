import axios from "axios";

export const api = axios.create({
	baseURL: "http://localhost:3306/api",
});

export { userApi } from "./userApi";
export { candidateApi } from "./candidateApi";
export { lecturerApi } from "./lecturerApi";
