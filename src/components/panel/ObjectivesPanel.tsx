import {
    Button,
    Checkbox,
    createStyles,
    Fab,
    FormControlLabel,
    Grid,
    makeStyles,
    TextField,
    Theme
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import React, {FC, useContext, useEffect, useState} from 'react';
import {ObjectiveDisplayContainer} from '~/components/fetchableDisplay/FetchableDisplayContainer';
import {CurrentUserContext} from '~/context/CurrentUserProvider';
import {Authority} from '~/enums/Authority';
import {ObjectiveType} from '~/enums/ObjectiveType';
import useEndpoint from '~/hooks/useEndpoint';
import useInfiniteScroller, {InfiniteScroller} from '~/hooks/useInfiniteScroller';
import {Objective} from '~/model/usergeneratedcontent/Objective';
import Spinner from '../Spinner';
import styles from './styles/ObjectivePanelStyle';
import MyPaper from "~/components/mui/MyPaper";
import {filterByNormalizedWorldSplit} from "~/utils/filterByNormalizedWorldSplit";
import {getHumanReadableTextFromRTEContent} from "~/utils/getHumanReadableTextFromRTEContent";
import SearchIcon from '@material-ui/icons/Search';
import {isValidNonEmptyString} from "~/utils/CommonValidators";

const useStyles = makeStyles((theme: Theme) => createStyles(styles));

interface Props {
    filteredObjectiveTypes: ObjectiveType[];
}

const ObjectivesPanel: FC<Props> = (props) => {
    const classes = useStyles();
    const currentUser = useContext(CurrentUserContext);

    const infiniteScroller: InfiniteScroller = useInfiniteScroller({
        startingShowCount: 15,
    });

    const [wasCreateNewObjectiveClicked, setWasCreateNewObjectiveClicked] = useState<boolean>(false);
    const [filterTextInputValue, setFilterTextInputValue] = useState<string>('');
    const [shouldSearchInTitle, setShouldSearchInTitle] = useState<boolean>(true);
    const [shouldSearchInProgramTitle, setShouldSearchInProgramTitle] = useState<boolean>(true);
    const [shouldSearchInDescription, setShouldSearchInDescription] = useState<boolean>(false);

    const usedEndpoint = useEndpoint<Objective[]>({
        conf: {
            url: '/api/up/server/api/objective/listForDisplay',
            method: 'post',
            data: {
                objectiveTypes: props.filteredObjectiveTypes,
            },
        },
        deps: props.filteredObjectiveTypes,
        onSuccess: (res) => {
            infiniteScroller.setMaxLength(res.data.length);
        },
    });

    useEffect(() => {
        setWasCreateNewObjectiveClicked(false);
    }, [usedEndpoint.data]);

    useEffect(() => {
        infiniteScroller.resetCurrentShownCount();
        setFilterTextInputValue('');
    }, [props.filteredObjectiveTypes]);

    return (
        <div>
            {!wasCreateNewObjectiveClicked && currentUser.hasAuthority(Authority.ObjectiveEditor) && (
                <>
                    <Fab
                        size="large"
                        aria-label="add"
                        color="secondary"
                        style={{position: 'fixed'}}
                        className={classes.floatingActionButton}
                        onClick={() => setWasCreateNewObjectiveClicked(true)}
                    >
                        <AddIcon/>
                    </Fab>
                </>
            )}

            {wasCreateNewObjectiveClicked && (
                <ObjectiveDisplayContainer shouldCreateNew={true}
                                           onCancelledNewCreation={() => setWasCreateNewObjectiveClicked(false)}/>
            )}

            {usedEndpoint.pending && <Spinner/>}

            {usedEndpoint.failed && <p>Couldn't load objectives :'(</p>}

            {usedEndpoint.succeeded && (
                <Grid container direction="column" spacing={2}>
                    <Grid item>
                        <MyPaper>
                            <Grid container direction="column" spacing={2}>
                                <Grid item>
                                    <TextField autoFocus
                                               fullWidth
                                               label="Feladatok szűrése"
                                               value={filterTextInputValue}
                                               onChange={(e) => setFilterTextInputValue(e.target.value)}
                                               InputProps={{
                                                   startAdornment: <SearchIcon/>
                                               }}
                                    />
                                </Grid>
                                <Grid container direction="row" spacing={2}>
                                    <Grid item>
                                        <FormControlLabel
                                            control={
                                                <Checkbox

                                                    checked={shouldSearchInTitle}
                                                    onChange={(e) => setShouldSearchInTitle(e.target.checked)}
                                                    color="primary"
                                                />
                                            }
                                            labelPlacement="start"
                                            label="Keresés címben"
                                        />
                                    </Grid>
                                    <Grid item>
                                        <FormControlLabel
                                            control={
                                                <Checkbox

                                                    checked={shouldSearchInProgramTitle}
                                                    onChange={(e) => setShouldSearchInProgramTitle(e.target.checked)}
                                                    color="primary"
                                                />
                                            }
                                            labelPlacement="start"
                                            label="Keresés a program címében"
                                        />
                                    </Grid>
                                    <Grid item>
                                        <FormControlLabel
                                            control={
                                                <Checkbox

                                                    checked={shouldSearchInDescription}
                                                    onChange={(e) => setShouldSearchInDescription(e.target.checked)}
                                                    color="secondary"
                                                />
                                            }
                                            labelPlacement="start"
                                            label="Keresés a leírásban"
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>

                        </MyPaper>
                    </Grid>
                    {filterByNormalizedWorldSplit<Objective>(usedEndpoint.data, {
                        inputValue: filterTextInputValue,
                        getOptionLabel: (objective) => {
                            const searchParts: string[] = [];

                            if (shouldSearchInTitle) {
                                searchParts.push(objective.title);
                            }

                            if (shouldSearchInProgramTitle && isValidNonEmptyString(objective.programTitle)) {
                                searchParts.push(objective.programTitle);
                            }
                            if (shouldSearchInDescription) {
                                searchParts.push(getHumanReadableTextFromRTEContent(objective.description));
                            }
                            return searchParts.join(' ');
                        },
                    }).slice(0, infiniteScroller.shownCount)
                        .map((objective, index) => {
                            return (
                                <Grid item>
                                    <ObjectiveDisplayContainer
                                        key={objective.id}
                                        overriddenBeginningEntity={objective}
                                        shouldCreateNew={false}
                                    />
                                </Grid>
                            );
                        })}
                    {infiniteScroller.canShownCountBeIncreased && (
                        <MyPaper p={0}>
                            <Grid item container justify="center">
                                <Button
                                    size="large"
                                    variant="text"
                                    fullWidth
                                    color="secondary"
                                    onClick={() => infiniteScroller.increaseShownCount(5)}
                                    className={classes.showMoreButton}
                                >
                                    &darr; Show more &darr;
                                </Button>
                            </Grid>
                        </MyPaper>
                    )}
                </Grid>
            )}
        </div>
    );
};

export default ObjectivesPanel;
