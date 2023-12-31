import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { from, map, Observable, of, switchMap, tap } from 'rxjs';
import { User } from 'src/user/models/user.interface';
import { UserService } from 'src/user/service/user.service';
import { Repository } from 'typeorm';
import { BlogEntryEntity } from '../model/blog-entry.entity';
import { BlogEntry } from '../model/blog-entry.interface';
const slugify = require('slugify');

@Injectable()
export class BlogService {

  constructor(@InjectRepository(BlogEntryEntity) private readonly blogRepository: Repository<BlogEntryEntity>,
  private userService: UserService) {}

  generateSlug(title: String): Observable<any> {
    return of(slugify(title));
  }

  create(user: User, blogEntry: BlogEntry): Observable<BlogEntry> {
    blogEntry.author = user;
    return this.generateSlug(blogEntry.title).pipe(
      switchMap((slug: string) => {
        blogEntry.slug = slug;
        return from(this.blogRepository.save(blogEntry));
      })
    )
  }

  updateOne(id: number, blogEntry: BlogEntry): Observable<BlogEntry> {
    return from(this.blogRepository.update(id, blogEntry)).pipe(
      switchMap(() => this.findOne(id)) //finding blogEntry
    )
  }

  findAll(): Observable<BlogEntry[]> {
    return from(this.blogRepository.find({relations: ['author']}));
  }

  paginateAll(options: IPaginationOptions): Observable<Pagination<BlogEntry>> {
    return from(paginate<BlogEntryEntity>(this.blogRepository, options, {
      relations: ['author']
    })).pipe(
      map((blogEntries: Pagination<BlogEntry>) => blogEntries)
    )
  }

  paginateByUser(options: IPaginationOptions, userId: number): Observable<Pagination<BlogEntry>> {
    return from(paginate<BlogEntryEntity>(this.blogRepository, options, {
      relations: ['author'],
      where: [
        {id: userId}
      ]
    })).pipe(
      map((blogEntries: Pagination<BlogEntry>) => blogEntries)
    )
  }

  findOne(id: number): Observable<BlogEntry> {
    return from(this.blogRepository.findOne({where: {id: id}}
        // {relations: ['author']}
      ));
  }

  findByUserId(userId: any): Observable<BlogEntry[]> {
    return from(this.blogRepository.find({
      where: {
        author: userId
      },
      relations: ['author']
    }
    )).pipe(
      map((blogEntries: BlogEntry[]) => blogEntries)
    )
  }

  deleteOne(id: number): Observable<any> {
    return from(this.blogRepository.delete(id));
  }

}
