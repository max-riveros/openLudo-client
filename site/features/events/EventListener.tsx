type EventClass<T> = new (...args: any[]) => T;

class EventListener {
    private listeners: Map<Function, Set<Function>>;
    constructor() {
        this.listeners = new Map<Function, Set<Function>>();
    }

    subscribe<E extends Event>(EventType: EventClass<E>, callback: (event: E) => void): Function {
        let listenerSubset = this.listeners.get(EventType);
        if (listenerSubset == undefined) {
            this.listeners.set(EventType, new Set())
            listenerSubset = this.listeners.get(EventType);
        }

        if (!listenerSubset?.has(callback)) listenerSubset?.add(callback);

        return () => this.unsubscribe(EventType, callback);
    }
    unsubscribe<E extends Event>(EventType: EventClass<E>, callback: (event: E) => void) {
        this.listeners.get(EventType)?.delete(callback);
    }
    emit<E extends Event>(event: E) {
        for (const [EventType, callbacks] of this.listeners) {
            if (event instanceof (EventType as any)) {
                callbacks.forEach(cb => cb(event));
            }
        }
    }
}


export const eventListener = new EventListener();