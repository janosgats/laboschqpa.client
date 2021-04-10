import Head from 'next/head'
import {NextPage} from "next";
import React from "react";
import 'react-notifications/lib/notifications.css';
import useEndpoint from "~/hooks/useEndpoint";
import Link from "next/link";

interface TeamWithScore {
    id: number;
    name: string;
    archived: boolean;
    score: number;
}

//TODO: Replace with MUi
const Index: NextPage = () => {
    const [teamWithScoreArray, error, pending] = useEndpoint<TeamWithScore[]>({
        config: {
            url: "/api/up/server/api/team/listActiveTeamsWithScores"
        }
    });

    return (
        <div>
            <Head>
                <title>Teams</title>
            </Head>

            {
                pending && (
                    <p>Pending...</p>
                )
            }
            {
                error && (
                    <p>Couldn't load teams :'(</p>
                )
            }
            {
                teamWithScoreArray &&
                teamWithScoreArray.map((team, index) => {
                    return (
                        <div>
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
