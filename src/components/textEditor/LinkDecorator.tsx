import React, {FunctionComponent, useContext} from "react";
import {Link as MuiLink, useTheme} from '@material-ui/core';
import Link from 'next/link';
import EventBus from "~/utils/EventBus";
import {EditorContext} from "~/context/EditorContextProvider";

export const LinkMatcherRegex = /((https?:\/\/)|(www\.))[^\s]+/gi;

const SITE_DOMAINS: string[] = ['schq.party', 'www.schq.party', 'localhost'];

const LinkDecorator: FunctionComponent<{ decoratedText: string }> = (props) => {
    const theme = useTheme();
    const editorContext = useContext(EditorContext);

    let targetUrl = '';
    if (!props.decoratedText.startsWith('http://') && !props.decoratedText.startsWith('https://')) {
        targetUrl = 'http://';
    }
    targetUrl += props.decoratedText.trim();

    const isInnerLink = SITE_DOMAINS.some(domain => targetUrl.startsWith('http://' + domain) || targetUrl.startsWith('https://' + domain));

    return (
        <>
            <MuiLink style={{cursor: 'pointer'}}>
                {isInnerLink && editorContext.isMuiRteReadonly ? (
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