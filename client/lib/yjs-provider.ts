import * as Y from 'yjs';

export class CustomWebsocketProvider {
  private ws: WebSocket | null = null;
  private doc: Y.Doc;
  private roomId: string;
  private url: string;
  private shouldConnect: boolean = true;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;

  constructor(serverUrl: string, roomId: string, doc: Y.Doc) {
    this.doc = doc;
    this.roomId = roomId;
    this.url = `${serverUrl}/yjs?room=${roomId}`;
    this.connect();
  }

  private connect() {
    if (!this.shouldConnect) return;

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('Yjs WebSocket connected');
        this.reconnectAttempts = 0;
        
        // Request full state by sending empty message
        // The server will respond with the full document state
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(new Uint8Array(0));
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const update = new Uint8Array(event.data);
          Y.applyUpdate(this.doc, update);
        } catch (error) {
          console.error('Error applying Yjs update:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('Yjs WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('Yjs WebSocket closed');
        this.ws = null;
        this.scheduleReconnect();
      };

      // Send updates when document changes
      this.doc.on('update', (update: Uint8Array) => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(update);
        }
      });
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (!this.shouldConnect || this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  public destroy() {
    this.shouldConnect = false;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

