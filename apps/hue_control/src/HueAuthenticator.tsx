import { useCogsConfig } from "@clockworkdog/cogs-client-react";
import { useEffect, useState } from "react"
import { useTypedCogsConnection } from "./hooks/useTypedCogsConnection";
import { CLIENTKEY_KEY_PREFIX, USERNAME_KEY_PREFIX } from "./constants";

const LINK_BUTTON_NOT_PRESSED = 101;
const AUTH_BODY = JSON.stringify({
    devicetype: "cogs#cogs",
    generateclientkey: true
});

function getAuthenticationUrl(ipAddress: string) {
    return `http://${ipAddress}/api`
}

export default function HueAuthenticator() {
    const connection = useTypedCogsConnection();

    const [bridgeConnection, setBridgeConnection] = useState(false);
    const bridgeIpAddress = useCogsConfig(connection)["Bridge IP Address"];

    async function makeAuthenticationRequest(ipAddress: string) {
        console.log("Sending auth request")
        try {
            const response = await fetch(getAuthenticationUrl(ipAddress), {
                method: "POST",
                body: AUTH_BODY
            });
            if (!response.ok) {
                console.error(`Bridge returned non-OK status ${response.status}`);
                setBridgeConnection(false);
            }
            const result = (await response.json())[0];

            if (result['error']) {
                const type = result['error']['type'];
                const description = result['error']['description'];
                if (type === LINK_BUTTON_NOT_PRESSED) {
                    console.log("Link button not pressed");
                    setBridgeConnection(true);
                } else {
                    console.error(`Bridge returned error ${type}: ${description}`);
                    setBridgeConnection(false);
                }
            } else {
                const username = result['success']['username'];
                const clientkey = result['success']['clientkey'];
                // TODO don't use IPs - maybe bridge IDs
                const username_key = USERNAME_KEY_PREFIX + bridgeIpAddress;
                const clientkey_key = CLIENTKEY_KEY_PREFIX + bridgeIpAddress;

                connection.store.setItems({ [username_key]: username, [clientkey_key]: clientkey });
                setBridgeConnection(true);
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message)
            } else {
                throw error;
            }
        }
    }

    useEffect(() => {
        // TODO This can cause tens of requests hanging around until they time out
        const interval = setInterval(async () => {
            await makeAuthenticationRequest(bridgeIpAddress);
        }, 4000);
        return () => { clearInterval(interval) }
    }, [bridgeIpAddress]);

    if (bridgeConnection) {
        return (
            <div>
                Press the button on your Hue bridge, then wait up to 10 seconds for COGS to authorise.
            </div>
        )
    } else {
        return (
            <div>
                Connecting to your bridge...
            </div>
        )
    }
}