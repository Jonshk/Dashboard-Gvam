import { TokenResponse } from "./token-response.model";

export interface LoginResponse {
    email: string;
    tokens: TokenResponse
}
