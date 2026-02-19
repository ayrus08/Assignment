export const fetchStrokes = async (roomId: string, token: string) => {
	const res = await fetch(`http://localhost:3001/api/rooms/${roomId}/strokes`, {
		headers: { Authorization: `Bearer ${token}` }
	});

	if (!res.ok) throw new Error('auth failed');

	return res.json();
};

export const clearRoomApi = async (roomId: string, token: string) => {
	await fetch(`http://localhost:3001/api/rooms/${roomId}/clear`, {
		method: 'POST',
		headers: { Authorization: `Bearer ${token}` }
	});
};
