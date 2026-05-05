import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class TokenService {
  private accessToken: string | null = sessionStorage.getItem("accessToken");

  getAccessToken(): string | null {
    return this.accessToken;
  }

  setAccessToken(token: string): void {
    this.accessToken = token;
    sessionStorage.setItem("accessToken", token);
  }

  clearAccessToken(): void {
    this.accessToken = null;
    sessionStorage.removeItem("accessToken");
  }
}

