import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { User } from 'src/app/model/user.interface';

export interface UserData {
  items: User[],
  meta: {
    totalItems: number,
    itemCount: number,
    itemsPerPage: number,
    totalPages: number,
    currentPage: number 
  },
  links: {
    first: string,
    previous: string,
    next: string, 
    last: string
  }
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  findOne(id: number): Observable<User> {
    return this.http.get('/api/users/' + id).pipe(
      map((user:User) => user)
    )
  }

  updateOne(user: User): Observable<User> {
    return this.http.put('api/users/' + user.id, user);
  }

  findAll(page: number, limit: number): Observable<UserData> {
    let params = new HttpParams();

    params = params.append('page', String(page));
    params = params.append('limit', String(limit));
    
    return this.http.get('/api/users', {params}).pipe(
      map((userData: any) => userData), //????????????????????////
      catchError(err => throwError(err))
    )
  }

  uploadProfileImage(formData: FormData): Observable<any> {
    return this.http.post<FormData>('/api/users/upload', formData, {
      reportProgress: true,
      observe: 'events'
    })
  }

  paginateByName(page: number, limit: number, username: string):Observable<UserData> {
    let params = new HttpParams();

    params = params.append('page', String(page));
    params = params.append('limit', String(limit));
    params = params.append('username', username);

    return this.http.get('/api/users', {params}).pipe(
      map((userData: any) => userData), //????????????????????////
      catchError(err => throwError(err))
    )
  }
}
