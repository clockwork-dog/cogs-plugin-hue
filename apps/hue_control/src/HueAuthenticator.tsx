import { useEffect } from "react";
import { LINK_BUTTON_NOT_PRESSED, postAuthRequest } from "./hueApi/hueApiV1";
import {
  HueApiKeys,
  HueApiV1AuthBody,
  HueApiV1ResponseError,
  UnauthenticatedHueBridgeConnection,
} from "./types";

const AUTH_BODY: HueApiV1AuthBody = {
  devicetype: "cogs#cogs",
  generateclientkey: true,
};

async function pollAuthenticationRequest({
  connection,
  authenticatedCallback,
  errorCallback,
}: {
  connection: UnauthenticatedHueBridgeConnection;
  authenticatedCallback: (hueApiKeys: HueApiKeys) => void;
  errorCallback: (error: HueApiV1ResponseError) => void;
}) {
  console.log("Sending auth request");
  const response = await postAuthRequest(connection, AUTH_BODY);
  if (response.result === "success") {
    const hueApiKeys = {
      applicationkey: response.response.username,
      clientkey: response.response.clientkey,
    };
    authenticatedCallback(hueApiKeys);
  } else if (
    response.error_cause === "body_error" &&
    response.errors[0].type === LINK_BUTTON_NOT_PRESSED
  ) {
    console.log("Link button not pressed");
  } else {
    errorCallback(response);
  }
}

export default function HueAuthenticator({
  connection,
  authenticatedCallback,
  errorCallback,
}: {
  connection: UnauthenticatedHueBridgeConnection;
  authenticatedCallback: (hueApiKeys: HueApiKeys) => void;
  errorCallback: (error: HueApiV1ResponseError) => void;
}) {
  useEffect(() => {
    // TODO This can cause tens of requests hanging around until they time out
    const interval = setInterval(async () => {
      await pollAuthenticationRequest({
        connection,
        authenticatedCallback,
        errorCallback,
      });
    }, 4000);
    return () => {
      clearInterval(interval);
    };
  }, [connection, authenticatedCallback, errorCallback]);

  return (
    <div>
      Press the button on your Hue bridge, then wait up to 10 seconds for COGS
      to authorise.
    </div>
  );
}
