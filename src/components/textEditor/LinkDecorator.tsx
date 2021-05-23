import React, {FunctionComponent} from "react";
import EventBus from "~/utils/EventBus";

export const LinkMatcherRegex = /((https?:\/\/)|(www\.))[^\s]+/gi;

const LinkDecorator: FunctionComponent<{ decoratedText: string }> = (props) => {
    let targetUrl = '';
    if (!props.decoratedText.startsWith('http://') && !props.decoratedText.startsWith('https://')) {
        targetUrl = 'http://';
    }
    targetUrl += props.decoratedText;

    return (
        <a
            href={targetUrl}
            target={"_blank"}
            onClick={(e) => {
                try {
                    if (e.ctrlKey) {
                        window.open(targetUrl, '_blank').focus();
                    }
                } catch (e) {
                    console.error("Cannot open link", [e]);
                    EventBus.notifyWarning(e.message, "Cannot open link");
                }
            }}
            style={{
                color: "blue",
                cursor: "pointer",
                textDecoration: "underline",
            }}
        >
            {props.children}
        </a>
    )
};

export default LinkDecorator;