// next-frontend/lib/socket.ts

type WSMessage = {
  type: string;
  payload: any;
};

class WSClient {
  private url: string;
  private socket: WebSocket | null = null;
  private listeners: Record<string, ((payload: any) => void)[]> = {};
  private queue: WSMessage[] = [];
  private isConnected = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor(url: string) {
    this.url = url;
    if (typeof window !== 'undefined') {
      this.connect();
    }
  }

  private connect() {
    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        console.log('✅ Real-time System connected');
        this.isConnected = true;
        this.emitToListeners('connect', null);

        // Flush queued messages
        while (this.queue.length > 0) {
          const msg = this.queue.shift();
          if (msg) this.send(msg.type, msg.payload);
        }
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type) {
            this.emitToListeners(data.type, data.payload);
          }
        } catch (e) {
          console.error('WebSocket Message Parse Error:', e);
        }
      };

      this.socket.onclose = (event) => {
        console.log(`❌ Real-time connection closed (${event.code}). Retrying in 4s...`);
        this.isConnected = false;
        this.emitToListeners('disconnect', null);

        if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = setTimeout(() => this.connect(), 4000);
      };

      this.socket.onerror = (err) => {
        console.error('WebSocket Error:', err);
      };
    } catch (error) {
      console.error('WebSocket Connection Hook Failed:', error);
    }
  }

  public on(event: string, callback: (payload: any) => void) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);

    // If it's a connect listener and we're already open, fire it immediately.
    if (event === 'connect' && this.isConnected) {
      callback(null);
    }

    return () => this.off(event, callback);
  }

  public off(event: string, callback: (payload: any) => void) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  public emit(type: string, payload: any) {
    const msg: WSMessage = { type, payload };
    if (this.isConnected && this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(msg));
    } else {
      console.log(`📦 Queuing real-time signal: ${type}`);
      this.queue.push(msg);
    }
  }

  // Alias for emit to match legacy usage
  public send(type: string, payload: any) {
    this.emit(type, payload);
  }

  private emitToListeners(event: string, payload: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(payload));
    }
  }

  public disconnect() {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

// Singleton instance
// const socket = new WSClient("wss://help-center-backend-1.onrender.com/ws");
const socket = new WSClient("ws://localhost:8090/ws");
export default socket;
