import Head from "next/head";
import { NextPage } from "next";
import React from "react";
import useEndpoint from "~/hooks/useEndpoint";
import Link from "next/link";
import NotTeamMemberBanner from "~/components/banner/NotTeamMemberBanner";

import MUIPaper from "@material-ui/core/Paper";
import {
  Button,
  Table,
  TableRow,
  TableHead,
  TableCell,
} from "@material-ui/core";

interface TeamWithScore {
  id: number;
  name: string;
  archived: boolean;
  score: number;
}

const Index: NextPage = () => {
  const usedEndpoint = useEndpoint<TeamWithScore[]>({
    conf: {
      url: "/api/up/server/api/team/listActiveTeamsWithScores",
    },
  });

  return (
    <div>
      <Head>
        <title>Teams</title>
      </Head>

      <NotTeamMemberBanner />

      {usedEndpoint.pending && <p>Pending...</p>}
      {usedEndpoint.failed && <p>Couldn't load teams :'(</p>}
      {usedEndpoint.data && (
        <MUIPaper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Team Name</TableCell>
                <TableCell>Score</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            {usedEndpoint.data.map((team, index) => {
              return (
                <TableRow>
                  <TableCell>{team.id}</TableCell>
                  <TableCell>{team.name}</TableCell>
                  <TableCell>{team.score}</TableCell>
                  <TableCell>
                    <Link href={`/teams/team/${team.name}?id=${team.id}`}>
                      <Button variant="contained" color="primary">Show Team</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </Table>
        </MUIPaper>
      )}
    </div>
  );
};

export default Index;
