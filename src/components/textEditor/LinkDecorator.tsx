import React, {FunctionComponent, useContext} from "react";
import {Link as MuiLink, useTheme} from '@material-ui/core';
import Link from 'next/link';
import EventBus from "~/utils/EventBus";
import {EditorContext} from "~/context/EditorContextProvider";
import {isValidNonEmptyString} from "~/utils/CommonValidators";

export const LinkMatcherRegex = /((https?:\/\/)|(www\.))[^\s]+/gi;

const LinkDecorator: FunctionComponent<{ decoratedText: string }> = (props) => {
    const theme = useTheme();
    const editorContext = useContext(EditorContext);

    let targetUrl = '';
    if (!props.decoratedText.startsWith('http://') && !props.decoratedText.startsWith('https://')) {
        targetUrl = 'http://';
    }
    targetUrl += props.decoratedText.trim();

    const isInnerLink = isValidNonEmptyString(location?.host) &&
        (targetUrl.startsWith('http://' + location.host) || targetUrl.startsWith('https://' + location.host)
            || targetUrl.startsWith('http://www.' + location.host) || targetUrl.startsWith('https://www.' + location.host));

    return (
        <>
            <MuiLink style={{cursor: 'pointer'}}>
                {isInnerLink && !editorContext.isEdited ? (
                    <Link href={targetUrl}>
                        <span>
                            {props.children}
                        </span>
                    </Link>
                ) : (
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
                        style={{color: theme.palette.primary.main, textDecoration: 'none'}}
                    >
                        {props.children}
                    </a>
                )}
            </MuiLink>
        </>
    )
};

export default LinkDecorator;