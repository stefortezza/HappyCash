import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDetail } from 'src/interfaces/user-detail';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiURL = 'https://api.happycash.it/api/users';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<UserDetail[]> {
    return this.http.get<UserDetail[]>(this.apiURL);
  }

  getAllComuni() {
  return this.http.get<string[]>(`${this.apiURL}/comuni`);
}


  getUserById(id: number): Observable<UserDetail> {
    return this.http.get<UserDetail>(`${this.apiURL}/${id}`);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`);
  }

  approveUser(id: number): Observable<UserDetail> {
    return this.http.put<UserDetail>(`${this.apiURL}/approve/${id}`, {});
  }

  updateUser(id: number, user: UserDetail): Observable<UserDetail> {
    return this.http.put<UserDetail>(`${this.apiURL}/update-profile/${id}`, user);
  }
    
}