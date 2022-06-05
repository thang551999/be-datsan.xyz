import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { API_SUCCESS } from '../../common/constant';
import { JwtAuthGuard } from '../auth/jwt.strategy';
import { IUserInfo, UserInfo } from '../../common/decorators/user.decorator';

@Controller('comment')
@UseGuards(JwtAuthGuard)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @UserInfo() user: IUserInfo,
  ) {
    const comment = await this.commentService.create(createCommentDto, user);

    return {
      code: API_SUCCESS,
      data: comment,
    };
  }

  @Get()
  findAll() {
    return this.commentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentService.update(+id, updateCommentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commentService.remove(+id);
  }
}
