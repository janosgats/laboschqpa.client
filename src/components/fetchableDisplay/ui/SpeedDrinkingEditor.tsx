import {Button, createStyles, Dialog, DialogContent, makeStyles, TextField, Theme} from '@material-ui/core';
import {Autocomplete} from '@material-ui/lab';
import React, {FC} from 'react';
import SpeedDrinkingCategorySelector from '~/components/selector/SpeedDrinkingCategorySelector';
import {SpeedDrinkingCategory} from '~/enums/SpeedDrinkingCategory';
import useEndpoint from '~/hooks/useEndpoint';
import {UserInfo} from '~/model/UserInfo';
import {dialogStyles} from '~/styles/dialog-styles';
import {isValidNumber} from '~/utils/CommonValidators';
import UserNameFormatter from '~/utils/UserNameFormatter';
import {filterByNormalizedWorldSplit} from "~/utils/filterByNormalizedWorldSplit";
import {useSpeedDrinkingUsersSharedCache} from "~/context/cache/SpeedDrinkingUsersSharedCacheProvider";
import SharedCache from "~/context/cache/SharedCache";

interface Props {
    isOpen: boolean;
    isCreatingNew: boolean;
    isApiCallPending: boolean;

    onCancel: () => void;
    onSave: () => void;
    onDelete: () => void;

    drinkerUserId: number;
    setDrinkerUserId: React.Dispatch<React.SetStateAction<number>>;
    time: number;
    setTime: React.Dispatch<React.SetStateAction<number>>;
    category: SpeedDrinkingCategory;
    setCategory: React.Dispatch<React.SetStateAction<SpeedDrinkingCategory>>;
    note: string;
    setNote: React.Dispatch<React.SetStateAction<string>>;
}

const useStyles = makeStyles((theme: Theme) => {
    return createStyles(dialogStyles);
});

function getSelectorOptionLabelForUser(userInfo: UserInfo): string {
    let prefix = '';
    if (userInfo.teamName) {
        prefix = userInfo.teamName + ': ';
    }
    return prefix + UserNameFormatter.getBasicDisplayName(userInfo);
}

const SpeedDrinkingEditor: FC<Props> = (props) => {
    const classes = useStyles();

    const usersCache: SharedCache<UserInfo[]> = useSpeedDrinkingUsersSharedCache();
    const usedEndpointUsers = useEndpoint<UserInfo[]>({
        conf: {
            url: '/api/up/server/api/user/listAllEnabledWithTeamName',
        },
        onSuccess: resp => {
            usersCache.setData(resp.data);
        },
        enableRequest: !usersCache.isSet,
    });

    function getRefreshUsersCacheButtonText() {
        if (usedEndpointUsers.pending) {
            return 'Refreshing cache...';
        }

        let text = 'Refresh users cache';
        if (usedEndpointUsers.failed) {
            text += ' (last failed)';
        }
        return text;
    }

    return (
        <Dialog open={props.isOpen} onClose={() => props.onCancel()}>
            <DialogContent className={classes.dialogContainer}>
                <h2 className={classes.dialogTitle}>Record Time</h2>

                <Button onClick={() => usedEndpointUsers.reloadEndpoint()}
                        disabled={usedEndpointUsers.pending}
                        color="secondary"
                        variant="outlined">
                    {getRefreshUsersCacheButtonText()}
                </Button>

                {usersCache.isSet && (
                    <>
                        <Autocomplete
                            style={{width: '350px', padding: '10px 0'}}
                            options={usersCache.data}
                            getOptionLabel={(userInfo) => getSelectorOptionLabelForUser(userInfo)}
                            renderInput={(params) => <TextField {...params} label="Drinker:" variant="outlined"/>}
                            value={usersCache.data.filter((u) => u.userId === props.drinkerUserId)[0]}
                            onChange={(e, val: UserInfo) => {
                                if (val && isValidNumber(val.userId)) {
                                    props.setDrinkerUserId(val.userId);
                                }
                            }}
                            filterOptions={filterByNormalizedWorldSplit}
                        />

                        <SpeedDrinkingCategorySelector value={props.category} onChange={props.setCategory}/>

                        <TextField
                            style={{margin: '20px 0 10px 0'}}
                            variant="outlined"
                            type="number"
                            inputProps={{step: 0.01}}
                            value={props.time}
                            onChange={(e) => props.setTime(Number.parseFloat(e.target.value))}
                            label="Time"
                        />

                        <TextField
                            style={{margin: '10px 0'}}
                            variant="outlined"
                            value={props.note}
                            onChange={(e) => props.setNote(e.target.value)}
                            label="Note"
                        />

                        {props.isCreatingNew && (
                            <Button variant="contained" onClick={props.onSave} disabled={props.isApiCallPending}>
                                Létrehoz
                            </Button>
                        )}
                        {!props.isCreatingNew && (
                            <>
                                <Button variant="contained" onClick={props.onSave}
                                        disabled={props.isApiCallPending}>
                                    Szerkesztés
                                </Button>
                                <Button variant="contained" onClick={props.onCancel}
                                        disabled={props.isApiCallPending}>
                                    Mégse
                                </Button>
                                <Button variant="contained" onClick={props.onDelete}
                                        disabled={props.isApiCallPending}>
                                    Törlés
                                </Button>
                            </>
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default SpeedDrinkingEditor;
