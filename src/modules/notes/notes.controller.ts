import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Request,
  Query,
  ParseIntPipe,
  DefaultValuePipe
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Notes')
@Controller('notes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new note' })
  @ApiResponse({ status: 201, description: 'Note successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Request() req, @Body() createNoteDto: CreateNoteDto) {
    return this.notesService.create(req.user._id, createNoteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notes for current user' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
  @ApiResponse({ status: 200, description: 'Notes retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    return this.notesService.findAll(req.user._id, page, limit, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a note by ID' })
  @ApiResponse({ status: 200, description: 'Note retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.notesService.findOne(req.user._id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a note' })
  @ApiResponse({ status: 200, description: 'Note updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  update(@Request() req, @Param('id') id: string, @Body() updateNoteDto: UpdateNoteDto) {
    return this.notesService.update(req.user._id, id, updateNoteDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a note' })
  @ApiResponse({ status: 200, description: 'Note deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  remove(@Request() req, @Param('id') id: string) {
    return this.notesService.remove(req.user._id, id);
  }

  @Patch(':id/toggle-public')
  @ApiOperation({ summary: 'Toggle note public status' })
  @ApiResponse({ status: 200, description: 'Note public status toggled successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  togglePublic(@Request() req, @Param('id') id: string) {
    return this.notesService.togglePublic(req.user._id, id);
  }
}
