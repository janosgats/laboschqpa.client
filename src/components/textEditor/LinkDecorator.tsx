import React, {FunctionComponent, useContext} from "react";
import {Link as MuiLink, useTheme} from '@material-ui/core';
import Link from 'next/link';
import EventBus from "~/utils/EventBus";
import {EditorContext} from "~/context/EditorContextProvider";
import {isValidNonEmptyString} from "~/utils/CommonValidators";

export const LinkMatcherRegex = /((https?:\/\/)|(www\.))[^\s]+/gi;

function isInnerLink(url: string): boolean {
    if (!isValidNonEmptyString(location?.host)) {
        return false;
    }
    return url.startsWith('http://' + location.host) || url.startsWith('https://' + location.host)
        || url.startsWith('http://www.' + location.host) || url.startsWith('https://www.' + location.host);
}

function getUrlPreparedForInnerLink(url: string) {
    let preparedUrl = url;
    if (preparedUrl.startsWith('http://')) {
        preparedUrl = preparedUrl.substring('http://'.length);
    }
    if (preparedUrl.startsWith('https://')) {
        preparedUrl = preparedUrl.substring('https://'.length);
    }
    if (preparedUrl.startsWith('www.')) {
        preparedUrl = preparedUrl.substring('www.'.length);
    }
    preparedUrl = preparedUrl.substring(location?.host?.length);

    return preparedUrl;
}

const LinkDecorator: FunctionComponent<{ decoratedText: string }> = (props) => {
    const theme = useTheme();
    const editorContext = useContext(EditorContext);

    let targetUrl = '';
    if (!props.decoratedText.startsWith('http://') && !props.decoratedText.startsWith('https://')) {
        targetUrl = 'http://';
    }
    targetUrl += props.decoratedText.trim();

    const innerLink = isInnerLink(targetUrl);


    return (
        <>
            <MuiLink style={{cursor: 'pointer'}}>
                {innerLink && !editorContext.isEdited ? (
                    <Link href={getUrlPreparedForInnerLink(targetUrl)}>
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