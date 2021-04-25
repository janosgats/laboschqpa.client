import Head from 'next/head'
import {NextPage} from "next";
import React from "react";
import useEndpoint from "~/hooks/useEndpoint";
import Link from "next/link";

interface TeamWithScore {
    id: number;
    name: string;
    archived: boolean;
    score: number;
}

const Index: NextPage = () => {
    const usedEndpoint = useEndpoint<TeamWithScore[]>({
        conf: {
            url: "/api/up/server/api/team/listActiveTeamsWithScores"
        }
    });

    return (
        <div>
            <Head>
                <title>Teams</title>
            </Head>

            {
                usedEndpoint.pending && (
                    <p>Pending...</p>
                )
            }
            {
                usedEndpoint.error && (
                    <p>Couldn't load teams :'(</p>
                )
            }
            {
                usedEndpoint.data &&
                usedEndpoint.data.map((team, index) => {
                    return (
                        <div key={team.id}>
                            <Link href={`/teams/team/${team.name}?id=${team.id}`}>
                                <a key={team.id}>{index + 1}. {team.name} - score: {team.score}</a>
                            </Link>
                        </div>
                    );
                })
            }
        </div>
    )
};

export default Index;
