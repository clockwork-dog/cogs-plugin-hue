import { CogsConnection, DataStoreItemEvent } from "@clockworkdog/cogs-client";
import { useEffect, useState } from "react";

export function useCogsDataStoreItem<Connection extends CogsConnection<any>>(connection: Connection, itemKey: string): unknown | undefined {
    const [item, setItem] = useState<unknown | undefined>(connection.store.getItem(itemKey));

    useEffect(() => {
        setItem(connection.store.getItem(itemKey));

        const listener = (event: DataStoreItemEvent) => {
            if (event.key == itemKey) {
                setItem(event.value);
            }
        };
        connection.store.addEventListener('item', listener);
        return () => { connection.store.removeEventListener('item', listener) }
    }, [connection, itemKey])

    return item;
}