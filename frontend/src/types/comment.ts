import { SelectedApplication } from "./selectedApplication";

interface Comment {
	commentId: number; // id for the comment
	authorUserId: number; // id of the user who made the comment
	selectedApplicationId: number; // id of the selected application this comment belongs to
	content: string; // content of the comment
	createdAt: Date; // date when the comment was created
	selectedApplication?: SelectedApplication;
}

export default Comment;
