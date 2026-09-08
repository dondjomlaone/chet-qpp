import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL.replace("/api", "");
console.log("SOCKET_URL je:", SOCKET_URL)

export const socket = io(SOCKET_URL, {
    autoConnect: false,
})