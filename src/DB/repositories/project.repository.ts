import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project } from '../models/project.model';
import { AbstractRepository } from './abstract.repository'; // 🚀 استيراد الملف الخاص بك

@Injectable()
export class ProjectRepository extends AbstractRepository<Project> {
  constructor(@InjectModel(Project.name) projectModel: Model<Project>) {
    super(projectModel);
  }
}
