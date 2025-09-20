import { Application } from "./application";

export interface SelectedApplication {
	id: number;
	userId: number;
	application: Application;
	rank: number;
	comments?: Comment[];
}
