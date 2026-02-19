import type { AuthRepository } from '$lib/domain/repositories/AuthRepository';
import type { User } from '$lib/domain/entities/User';
import { loginApi } from '../api/authApi';

export class AuthRepositoryImpl implements AuthRepository {
	async login(email: string, password: string): Promise<User> {
		const data = await loginApi(email, password);

		return {
			id: data.userId,
			email: data.email,
			role: data.role,
			token: data.token
		};
	}
}
