import React, {FC} from 'react'
import UserNameFormatter from "~/utils/UserNameFormatter";
import {SpeedDrinkingCategory} from "~/enums/SpeedDrinkingCategory";
import {isValidNumber} from "~/utils/CommonValidators";
import useEndpoint from "~/hooks/useEndpoint";
import {UserInfo} from "~/model/UserInfo";
import SpeedDrinkingCategorySelector from "~/components/selector/SpeedDrinkingCategorySelector";
import {Autocomplete} from "@material-ui/lab";
import {TextField} from "@material-ui/core";

interface Props {
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

function getSelectorOptionLabelForUser(userInfo: UserInfo): string {
    let prefix = "";
    if (userInfo.teamName) {
        prefix = userInfo.teamName + ': ';
    }
    return prefix + UserNameFormatter.getBasicDisplayName(userInfo)
}

const SpeedDrinkingEditor: FC<Props> = (props) => {
    const usedEndpointUsers = useEndpoint<UserInfo[]>({
        conf: {
            url: "/api/up/server/api/user/listAllWithTeamName",
        },
    });
    const fetchedUsers = usedEndpointUsers.data;

    return (
        <div style={{borderStyle: 'solid', borderColor: 'blue'}}>
            <p>TODO: This should be a modal</p>
            <button onClick={() => props.onCancel()}>Close modal</button>
            <br/>
            <>
                {usedEndpointUsers.pending && (
                    <p>Pending...</p>
                )}

                {usedEndpointUsers.failed && (
                    <>
                        <p>Couldn't load users :'(</p>
                        <button onClick={() => {
                            usedEndpointUsers.reloadEndpoint();
                        }}>
                            Retry
                        </button>
                    </>
                )}

                {fetchedUsers && (
                    <>
                        <br/>
                        <Autocomplete
                            options={fetchedUsers}
                            getOptionLabel={(userInfo) => getSelectorOptionLabelForUser(userInfo)}
                            renderInput={(params) => <TextField {...params} label="Drinker:" variant="outlined"/>}
                            value={fetchedUsers.filter(u => u.userId === props.drinkerUserId)[0]}
                            onChange={(e, val: UserInfo) => {
                                if (val && isValidNumber(val.userId)) {
                                    props.setDrinkerUserId(val.userId);
                                }
                            }}
                        />

                        <SpeedDrinkingCategorySelector value={props.category} onChange={props.setCategory}/>

                        <label>Time: </label>
                        <input type="number"
                               value={props.time}
                               step={0.01}
                               onChange={(e) => props.setTime(Number.parseFloat(e.target.value))}
                        />
                        <br/>

                        <label>Note: </label>
                        <input value={props.note}
                               onChange={(e) => props.setNote(e.target.value)}
                               maxLength={500}
                        />
                        <br/>

                        {props.isCreatingNew && (
                            <button onClick={props.onSave} disabled={props.isApiCallPending}>Create</button>
                        )}
                        {(!props.isCreatingNew) && (
                            <>
                                <button onClick={props.onSave} disabled={props.isApiCallPending}>Modify</button>
                                <button onClick={props.onCancel} disabled={props.isApiCallPending}>Cancel</button>
                                <button onClick={props.onDelete} disabled={props.isApiCallPending}>Delete</button>
                            </>
                        )}

                    </>
                )}
            </>
        </div>
    )
}

export default SpeedDrinkingEditor;