import { Container, createStyles, Grid, Icon, makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Theme, Typography, useTheme } from '@material-ui/core';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import React from 'react';
import NotTeamMemberBanner from '~/components/banner/NotTeamMemberBanner';
import Spinner from '~/components/Spinner';
import useEndpoint from '~/hooks/useEndpoint';
import { getStyles } from '~/components/team/styles/TeamStyle';

interface TeamWithScore {
  id: number;
  name: string;
  archived: boolean;
  score: number;
}

const useStyles = makeStyles((theme: Theme) => getStyles(theme))
const baseUrl = "https://laboschqpa-public.s3.pl-waw.scw.cloud/static/frontend/qpatrophy/";
const svgEndPoints = ["gold.svg", "silver.svg", "bronze.svg"];

export const separatedPoints = (score: number) => score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const Index: NextPage = () => {

  const classes = useStyles()

  const usedEndpoint = useEndpoint<TeamWithScore[]>({
    conf: {
      url: '/api/up/server/api/team/listActiveTeamsWithScores',
    },
  });


  const loadQpaIcon = (index: number) => <img
    src={baseUrl + svgEndPoints[index]}
    width={125 - index * 25}
    height={125 - index * 25}
  />





  return (
    <Container maxWidth="lg">
      <Head>
        <title>Teams</title>
      </Head>

      <NotTeamMemberBanner />

      {usedEndpoint.pending && <Spinner />}
      {usedEndpoint.failed && <p>Couldn't load teams :'(</p>}
      {usedEndpoint.data && (
        <TableContainer component={Paper}
          className={classes.tableContainer}
        >
          <Table size="medium"
          >
            <TableHead>
              <TableRow>
                <TableCell variant="head" align="center"><Typography variant="h4">Helyezés</Typography></TableCell>
                <TableCell variant="head" align="center"><Typography variant="h4">Csapat név</Typography></TableCell>
                <TableCell variant="head" align="center"><Typography variant="h4">Pontszám</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usedEndpoint.data.map((team, index) => {
                return (
                  <Link href={`/teams/team/${team.name}?id=${team.id}`}>
                    <TableRow
                      key={index}
                      hover
                      className={classes.tableRow}
                    >
                      <TableCell align="center">
                        {index < 3 ? loadQpaIcon(index) :
                          <Typography variant="h5">
                            {index + 1}.
                          </Typography>
                        }
                      </TableCell>
                      <TableCell align="center"><Typography variant="h5">{team.name}</Typography></TableCell>
                      <TableCell align="center"><Typography variant="h5">{separatedPoints(team.score)}</Typography></TableCell>
                    </TableRow>
                  </Link>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default Index;
