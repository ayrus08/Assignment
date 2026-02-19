import { LoginUser } from '$lib/application/usecases/LoginUser';
import { AuthRepositoryImpl } from '$lib/infrastructure/repositories/AuthRepositoryImpl';
import { authStorage } from '$lib/infrastructure/storage/authStorage';

const usecase = new LoginUser(new AuthRepositoryImpl());

export const loginController = async (email: string, password: string) => {
	const user = await usecase.execute(email, password);

	authStorage.setAuth({
		token: user.token,
		role: user.role,
		email: user.email,
		userId: user.id
	});

	return user;
};
