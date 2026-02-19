import { http } from './http';

export const loginApi = async (email: string, password: string) => {
	return http<{
		token: string;
		role: string;
		email: string;
		userId: string;
	}>('http://localhost:3001/api/login', {
		method: 'POST',
		body: JSON.stringify({ email, password })
	});
};
