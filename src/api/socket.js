import { io } from 'socket.io-client';

class SocketService {
    socket = null;

    connect(url, token) {
        if (this.socket) {
            this.disconnect();
        }

        this.socket = io(url, {
            auth: { token },
            transports: ['websocket'],
            reconnectionAttempts: 5,
        });

        this.socket.on('connect', () => {
            console.log('🔗 WebSocket connected');
        });

        this.socket.on('connect_error', (error) => {
            console.log('🔗 WebSocket connection error (auto-reconnecting):', error.message);
        });

        this.socket.on('disconnect', () => {
            console.log('🔗 WebSocket disconnected');
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    on(event, callback) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    off(event, callback) {
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }

    emit(event, data) {
        if (this.socket) {
            this.socket.emit(event, data);
        }
    }
}

export default new SocketService();
