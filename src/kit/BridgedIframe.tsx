/**
 * An iframe that talks to its host.
 *
 * cove's `JupyterLiteSession` couples three things: the message bridge, the iframe element, and
 * the JupyterLite URL shape (`/lab/tree?path=…`). Only the first two are general. This component
 * keeps those and takes the URL whole, so the same bridge serves a notebook, a REPL page, or
 * anything else that speaks the host protocol.
 *
 * `cove-bound`: no MD types cross this boundary — payloads are opaque.
 */
import IframeToFromHostMessageHandler from "@mat3ra/cove/dist/other/iframe-messaging/IframeToFromHostMessageHandler";
import { Action } from "@mat3ra/esse/dist/js/types";
import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export interface BridgedIframeHandle {
    /** Push a payload into the frame. No-op before the frame has mounted. */
    send: (data: unknown) => void;
}

export interface BridgedIframeProps {
    /** DOM id. The frame is addressed by id when posting, so it must be unique on the page. */
    id: string;
    /** Full URL to load. */
    src: string;
    /** Origin used both to post to the frame and to filter what it sends back. */
    origin: string;
    title: string;
    className?: string;
    /** The frame asked the host for data; whatever is returned is posted back to it. */
    onRequestData?: () => unknown;
    /** The frame pushed data to the host. */
    onReceiveData?: (payload: unknown) => void;
}

const SANDBOX = [
    "allow-scripts",
    "allow-same-origin",
    "allow-popups",
    "allow-forms",
    "allow-modals",
    "allow-top-navigation-by-user-activation",
    "allow-downloads",
].join(" ");

function BridgedIframeInner(
    { id, src, origin, title, className, onRequestData, onReceiveData }: BridgedIframeProps,
    ref: React.Ref<BridgedIframeHandle>,
) {
    const handler = useRef<IframeToFromHostMessageHandler | null>(null);

    // The bridge registers handlers once, at init. Reading the callbacks through a ref keeps a
    // re-render from needing to tear the bridge down — which would drop messages mid-flight, and
    // in JupyterLite's case cost the running kernel.
    const callbacks = useRef({ onRequestData, onReceiveData });
    callbacks.current = { onRequestData, onReceiveData };

    useEffect(() => {
        const bridge = new IframeToFromHostMessageHandler();
        handler.current = bridge;
        bridge.init(origin, id);
        bridge.addHandlers(Action.getData, [() => callbacks.current.onRequestData?.()]);
        bridge.addHandlers(Action.setData, [
            (payload: unknown) => {
                callbacks.current.onReceiveData?.(payload);
            },
        ]);
        return () => {
            bridge.destroy();
            handler.current = null;
        };
    }, [origin, id]);

    useImperativeHandle(
        ref,
        () => ({
            send: (data: unknown) => handler.current?.sendData(data as object),
        }),
        [],
    );

    return (
        <iframe
            name={id}
            title={title}
            id={id}
            src={src}
            className={className}
            sandbox={SANDBOX}
            width="100%"
            height="100%"
        />
    );
}

export const BridgedIframe = forwardRef(BridgedIframeInner);
