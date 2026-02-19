import { connect, StringCodec, type NatsConnection } from 'nats.ws';

let nc: NatsConnection;
const sc = StringCodec();

export const connectRoomNats = async () => {
	nc = await connect({
		servers: 'ws://localhost:8080'
	});

	console.log('connected to NATS');
	return nc;
};

export const getNats = () => nc;
export const codec = sc;
