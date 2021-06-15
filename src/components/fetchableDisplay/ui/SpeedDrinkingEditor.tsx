import React, {FC} from 'react'
import UserNameFormatter from "~/utils/UserNameFormatter";
import {SpeedDrinkingCategory} from "~/enums/SpeedDrinkingCategory";
import {isValidNumber} from "~/utils/CommonValidators";
import useEndpoint from "~/hooks/useEndpoint";
import {UserInfo} from "~/model/UserInfo";
import SpeedDrinkingCategorySelector from "~/components/selector/SpeedDrinkingCategorySelector";

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


const SpeedDrinkingEditor: FC<Props> = (props) => {
    const usedEndpointUsers = useEndpoint<UserInfo[]>({
        conf: {
            url: "/api/up/server/api/user/listAll",
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
                        <label>Drinker: </label>
                        <select value={props.drinkerUserId}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (isValidNumber(val)) {
                                        props.setDrinkerUserId(Number.parseInt(val));
                                    }
                                }}>

                            <option>Select a user...</option>
                            {fetchedUsers.map(user => {
                                return (
                                    <option key={user.userId} value={user.userId}>
                                        {UserNameFormatter.getBasicDisplayName(user)}
                                    </option>
                                );
                            })}
                        </select>
                        <br/>

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