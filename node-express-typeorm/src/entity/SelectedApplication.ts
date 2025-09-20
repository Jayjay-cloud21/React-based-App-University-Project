import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	JoinColumn,
	OneToMany,
	ManyToOne,
	Index,
} from "typeorm";

import { Comment } from "./Comment";
import { Application } from "./Application";

@Entity()
export class SelectedApplication {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	userId: number;

	@Column({ unique: true })
	applicationId: number;

	@Column()
	rank: number;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	// a selected application can have multiple comments
	@OneToMany(() => Comment, (comment) => comment.selectedApplication)
	comments: Comment[];

	// in the ERD, this is a one-to-one relationship
	// logically, only one selected application can be associated with an application
	// it's many-to-one here because it helps with querying
	@ManyToOne(() => Application)
	@JoinColumn({ name: "applicationId" })
	application: Application;
}
