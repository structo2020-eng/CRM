import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Types } from 'mongoose';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @ApiOperation({ summary: 'Create new development' })
  @ApiResponse({ status: 201, description: 'Project successfully created.' })
  async create(@Body() createProjectDto: CreateProjectDto, @Req() req: any) {
    const companyId = new Types.ObjectId(req.user.companyId);
    const userId = new Types.ObjectId(req.user.sub);
    return await this.projectService.create(
      createProjectDto,
      companyId,
      userId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve list of developments' })
  @ApiResponse({ status: 200, description: 'Successful list retrieval.' })
  async findAll(@Query() query: any, @Req() req: any) {
    const companyId = new Types.ObjectId(req.user.companyId);
    return await this.projectService.findAllProjects(query, companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    const companyId = new Types.ObjectId(req.user.companyId);
    return await this.projectService.findOneProject(
      new Types.ObjectId(id),
      companyId,
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project details' })
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Req() req: any,
  ) {
    const companyId = new Types.ObjectId(req.user.companyId);
    return await this.projectService.updateProject(
      new Types.ObjectId(id),
      updateProjectDto,
      companyId,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete project' })
  async remove(@Param('id') id: string, @Req() req: any) {
    const companyId = new Types.ObjectId(req.user.companyId);
    return await this.projectService.deleteProject(
      new Types.ObjectId(id),
      companyId,
    );
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive project' })
  async archive(@Param('id') id: string, @Req() req: any) {
    const companyId = new Types.ObjectId(req.user.companyId);
    return await this.projectService.archiveProject(
      new Types.ObjectId(id),
      companyId,
    );
  }

  @Get(':id/dashboard-stats')
  @ApiOperation({ summary: 'Get project statistics' })
  async getStats(@Param('id') id: string, @Req() req: any) {
    const companyId = new Types.ObjectId(req.user.companyId);
    return await this.projectService.getDashboardStats(
      new Types.ObjectId(id),
      companyId,
    );
  }

  @Get(':id/charts')
  @ApiOperation({ summary: 'Get project charts data' })
  async getCharts(@Param('id') id: string, @Req() req: any) {
    const companyId = new Types.ObjectId(req.user.companyId);
    return await this.projectService.getProjectCharts(
      new Types.ObjectId(id),
      companyId,
    );
  }
}
