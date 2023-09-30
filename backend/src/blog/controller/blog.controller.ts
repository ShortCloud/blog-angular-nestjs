import { Body, Controller, Delete, Get, Param, Post, Put, Query, Request, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import path, { join } from 'path';
import { map, Observable, of } from 'rxjs';
import {v4 as uuidv4} from 'uuid';
import { hasRoles } from 'src/auth/decorator/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard';
import { User } from 'src/user/models/user.interface';
import { UserIsAuthorGuard } from '../guards/userIsAuthor.guard';
import { BlogEntryEntity } from '../model/blog-entry.entity';
import { BlogEntry } from '../model/blog-entry.interface';
import { BlogService } from '../service/blog.service';
import { Image } from '../model/Image.interface';

export const BLOG_ENTRIES_URL = 'http://localhost:3000/api/blog-entries';

export const storage = {
  storage: diskStorage({
    destination: './uploads/blog-entry-images',
    filename: (req, file, cb) => {
        const filename: string = path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
        const extension: string = path.parse(file.originalname).ext;

        cb(null, `${filename}${extension}`)
    }
  })
}

@Controller('blog-entries')
export class BlogController {

  constructor(private blogService: BlogService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body()blogEntry: BlogEntry, @Request() req): Observable<BlogEntry> {
    const user = req.user.user;
    return this.blogService.create(user, blogEntry);
  }

  // @Get()
  // findBlogEntries(@Query('userId') userId: number): Observable<BlogEntry[]> {
  //   if(userId == null) {
  //     return this.blogService.findAll();
  //   } else {
  //     return this.blogService.findByUserId(userId);
  //   }
  // }

  @Get('')
  index( 
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  )
   {
    limit = limit > 100 ? 100 : limit;

    return this.blogService.paginateAll({
      limit: Number(limit),
      page: Number(page),
      route: BLOG_ENTRIES_URL
    })
  }

  @Get('user/:user')
  indexByUser( 
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Param('user') userId: number
  )
   {
    limit = limit > 100 ? 100 : limit;

    return this.blogService.paginateByUser({
      limit: Number(limit),
      page: Number(page),
      route: BLOG_ENTRIES_URL
    }, Number(userId))
  }

  @Get(':id')
  findOne(@Param('id') id: number): Observable<BlogEntry> {
    return this.blogService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, UserIsAuthorGuard)
  @Put(':id')
  updateOne(@Param('id') id: number, @Body() blogEntry: BlogEntry): Observable<BlogEntry> {
    return this.blogService.updateOne(Number(id), blogEntry);
  }

  @UseGuards(JwtAuthGuard, UserIsAuthorGuard)
  @Delete(':id')
  deleteOne(@Param('id') id: number) {
    return this.blogService.deleteOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', storage))
  uploadFile(@UploadedFile() file, @Request() req): Observable<Image> {
    return of(file);
  }

  @Get('image/:imagename')
  findImage(@Param('imagename') imagename, @Res() res): Observable<Object> {
    return of(res.sendFile(join(process.cwd(), 'uploads/blog-entry-images/' + imagename)));
  }
}

