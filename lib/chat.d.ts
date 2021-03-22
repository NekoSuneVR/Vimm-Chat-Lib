/// <reference types="node" />
import { EventEmitter } from "events";
export interface APIAuthentication {
	token?: string;
	clientId?: string;
	debug?: boolean;
}
export interface ConnectionMetadata {
	connected: boolean;
	readOnly: boolean;
}
export declare class GlimeshChat extends EventEmitter {
	private auth;
	private socket;
	private _connected;
	private heartbeatTimer;
	private readOnly;
	private token;
	private clientId;
	private channelId;
	private client;
	constructor(auth: APIAuthentication);
	getChannelId(username: string): Promise<number>;
	getUserId(username: string): Promise<number>;
	close(): Promise<void>;
	connect(channel: string): Promise<ConnectionMetadata>;
	sendMessage(message: string): Promise<void>;
	private buildPacket;
	send(packet: any): Promise<any>;
	readonly connected: boolean;
}
