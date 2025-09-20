"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectedApplication = void 0;
const typeorm_1 = require("typeorm");
const Comment_1 = require("./Comment");
const Application_1 = require("./Application");
let SelectedApplication = class SelectedApplication {
};
exports.SelectedApplication = SelectedApplication;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SelectedApplication.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SelectedApplication.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SelectedApplication.prototype, "applicationId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SelectedApplication.prototype, "rank", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SelectedApplication.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], SelectedApplication.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Comment_1.Comment, (comment) => comment.selectedApplication),
    __metadata("design:type", Array)
], SelectedApplication.prototype, "comments", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Application_1.Application),
    (0, typeorm_1.JoinColumn)({ name: "applicationId" }),
    __metadata("design:type", Application_1.Application)
], SelectedApplication.prototype, "application", void 0);
exports.SelectedApplication = SelectedApplication = __decorate([
    (0, typeorm_1.Entity)()
], SelectedApplication);
//# sourceMappingURL=SelectedApplication.js.map