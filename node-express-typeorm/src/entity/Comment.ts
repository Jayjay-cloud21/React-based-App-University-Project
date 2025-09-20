import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
} from "typeorm";
import { SelectedApplication } from "./SelectedApplication";

@Entity()
export class Comment {
	@PrimaryGeneratedColumn()
	commentId: number;

	@Column()
	selectedApplicationId: number;

	@Column()
	authorUserId: number; // id of the user who made the comment

	@Column()
	content: string;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	@ManyToOne(
		() => SelectedApplication,
		(selectedApplication) => selectedApplication.comments
	)
	@JoinColumn({ name: "selectedApplicationId" })
	selectedApplication: SelectedApplication;
}
