export const authStorage = {
	setAuth(data: { token: string; role: string; email: string; userId: string }) {
		localStorage.setItem('token', data.token);
		localStorage.setItem('role', data.role);
		localStorage.setItem('email', data.email);
		localStorage.setItem('userId', data.userId);
	}
};
