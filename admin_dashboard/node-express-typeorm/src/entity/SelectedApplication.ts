import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	JoinColumn,
	OneToMany,
	ManyToOne,
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

	@OneToMany(() => Comment, (comment) => comment.selectedApplication)
	comments: Comment[];

	@ManyToOne(() => Application)
	@JoinColumn({ name: "applicationId" })
	application: Application;
}
