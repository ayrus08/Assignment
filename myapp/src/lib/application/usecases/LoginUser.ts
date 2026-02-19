import type { AuthRepository } from '$lib/domain/repositories/AuthRepository';
import type { User } from '$lib/domain/entities/User';

export class LoginUser {
	constructor(private repo: AuthRepository) {}

	execute(email: string, password: string): Promise<User> {
		return this.repo.login(email, password);
	}
}
