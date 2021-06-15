import Head from 'next/head'
import {NextPage} from "next";
import React, {useState} from "react";
import useEndpoint from "~/hooks/useEndpoint";
import {CircularProgress} from "@material-ui/core";
import callJsonEndpoint from "~/utils/api/callJsonEndpoint";
import EventBus from "~/utils/EventBus";

interface AcceptedEmail {
    id: number;
    email: string;
    created: Date | string;
}

function removeAcceptedEmail(id: number) {
    if (!confirm(`Remove address with id ${id}?`)) {
        return;
    }

    callJsonEndpoint({
        conf: {
            url: '/api/up/server/api/acceptedEmail/delete',
            method: "DELETE",
            params: {
                id: id
            }
        }
    }).then(res => EventBus.notifySuccess('Removed'));
}

function recalculateAll() {
    callJsonEndpoint({
        conf: {
            url: '/api/up/server/api/acceptedEmail/recalculateAll',
            method: "POST",
        }
    }).then(res => EventBus.notifySuccess('Recalculated all'));
}

function recalculateByEmail(emails: string[]) {
    callJsonEndpoint({
        conf: {
            url: '/api/up/server/api/acceptedEmail/recalculateByEmail',
            method: "POST",
            data: emails
        }
    }).then(res => EventBus.notifySuccess('Recalculated by e-mails'));
}

function recalculateByUserId(userIds: number[]) {
    callJsonEndpoint({
        conf: {
            url: '/api/up/server/api/acceptedEmail/recalculateByUserId',
            method: "POST",
            data: userIds
        }
    }).then(res => EventBus.notifySuccess('Recalculated by user IDs'));
}


function addEmails(emails: string[]) {
    callJsonEndpoint({
        conf: {
            url: '/api/up/server/api/acceptedEmail/addEmails',
            method: "POST",
            data: emails
        }
    }).then(res => EventBus.notifySuccess('Added emails'));
}


const Index: NextPage = () => {
    const [textAreaValue, setTextAreaValue] = useState<string>('');

    const usedEndpoint = useEndpoint<AcceptedEmail[]>({
        conf: {
            url: '/api/up/server/api/acceptedEmail/listAll'
        }
    });

    function getPreparedTextareaContent(): string[] {
        return textAreaValue
            .replace('\n', '')
            .replace('\r', '')
            .split(',')
            .map(s => s.trim());
    }

    return (
        <>
            <Head>
                <title>Accepted Emails</title>
            </Head>

            <br/>
            <label>Comma separated list of email addresses or user IDs: </label>
            <br/>
            <textarea value={textAreaValue}
                      onChange={e => setTextAreaValue(e.target.value)}
                      rows={20} cols={80}/>
            <br/>
            <button onClick={() => addEmails(getPreparedTextareaContent())}>
                Add new emails
            </button>
            <button onClick={() => recalculateByEmail(getPreparedTextareaContent())}>
                Recalculate by e-mail
            </button>
            <button onClick={() => recalculateByUserId(getPreparedTextareaContent().map(s => Number.parseInt(s)))}>
                Recalculate by userId
            </button>
            <br/>
            <br/>
            <button onClick={() => recalculateAll()}>
                Recalculate all
            </button>
            <br/>
            <br/>
            <button onClick={() => usedEndpoint.reloadEndpoint()}>Reload list</button>
            <br/>
            {usedEndpoint.pending && <CircularProgress/>}
            {usedEndpoint.failed && <p>Couldn't load accepted emails :'(</p>}
            {usedEndpoint.data && (
                <table>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>email</th>
                        <th>created</th>
                        <th>remove</th>
                    </tr>
                    </thead>
                    <tbody>
                    {

                        usedEndpoint.data.map((acceptedEmail: AcceptedEmail) => {
                            return (
                                <tr key={acceptedEmail.id}>
                                    <td>{acceptedEmail.id}</td>
                                    <td>{acceptedEmail.email}</td>
                                    <td>{acceptedEmail.created}</td>
                                    <td>
                                        <button onClick={() => removeAcceptedEmail(acceptedEmail.id)}>Remove
                                        </button>
                                    </td>
                                </tr>
                            );
                        })
                    }
                    </tbody>
                </table>
            )}

        </>
    )
};

export default Index;
