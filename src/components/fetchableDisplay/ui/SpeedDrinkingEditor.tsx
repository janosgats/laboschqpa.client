import {Button, createStyles, Dialog, DialogContent, makeStyles, TextField, Theme} from '@material-ui/core';
import {Autocomplete} from '@material-ui/lab';
import React, {FC} from 'react';
import SpeedDrinkingCategorySelector from '~/components/selector/SpeedDrinkingCategorySelector';
import Spinner from '~/components/Spinner';
import {SpeedDrinkingCategory} from '~/enums/SpeedDrinkingCategory';
import useEndpoint from '~/hooks/useEndpoint';
import {UserInfo} from '~/model/UserInfo';
import {dialogStyles} from '~/styles/dialog-styles';
import {isValidNumber} from '~/utils/CommonValidators';
import UserNameFormatter from '~/utils/UserNameFormatter';

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

    const usedEndpointUsers = useEndpoint<UserInfo[]>({
        conf: {
            url: '/api/up/server/api/user/listAllWithTeamName',
        },
    });
    const fetchedUsers = usedEndpointUsers.data;

    return (
        <Dialog open={props.isOpen} onClose={() => props.onCancel()}>
            <DialogContent className={classes.dialogContainer}>
                <>
                    {usedEndpointUsers.pending && <Spinner />}

                    {usedEndpointUsers.failed && (
                        <>
                            <p>Couldn't load users :'(</p>
                            <button
                                onClick={() => {
                                    usedEndpointUsers.reloadEndpoint();
                                }}
                            >
                                Retry
                            </button>
                        </>
                    )}

                    {fetchedUsers && (
                        <>
                            <h2 className={classes.dialogTitle}>Record Time</h2>
                            <Autocomplete
                                style={{width: '350px', padding: '10px 0'}}
                                options={fetchedUsers}
                                getOptionLabel={(userInfo) => getSelectorOptionLabelForUser(userInfo)}
                                renderInput={(params) => <TextField {...params} label="Drinker:" variant="outlined" />}
                                value={fetchedUsers.filter((u) => u.userId === props.drinkerUserId)[0]}
                                onChange={(e, val: UserInfo) => {
                                    if (val && isValidNumber(val.userId)) {
                                        props.setDrinkerUserId(val.userId);
                                    }
                                }}
                            />

                            <SpeedDrinkingCategorySelector value={props.category} onChange={props.setCategory} />

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
                                    L??trehoz
                                </Button>
                            )}
                            {!props.isCreatingNew && (
                                <>
                                    <Button variant="contained" onClick={props.onSave} disabled={props.isApiCallPending}>
                                        Szerkeszt??s
                                    </Button>
                                    <Button variant="contained" onClick={props.onCancel} disabled={props.isApiCallPending}>
                                        M??gse
                                    </Button>
                                    <Button variant="contained" onClick={props.onDelete} disabled={props.isApiCallPending}>
                                        T??rl??s
                                    </Button>
                                </>
                            )}
                        </>
                    )}
                </>
            </DialogContent>
        </Dialog>
    );
};

export default SpeedDrinkingEditor;
