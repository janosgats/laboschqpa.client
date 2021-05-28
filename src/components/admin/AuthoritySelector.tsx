import React, {FC} from "react";
import {Authority, authorityData} from "~/enums/Authority";

interface Props {
    value: Authority;
    onChange: (value: Authority) => void;
}

const AuthoritySelector: FC<Props> = (props) => {
    return (
        <select value={props.value} onChange={e => {
            const authority = authorityData[e.target.value]?.authority;
            if (authority) {
                props.onChange(authority)
            }
        }}>
            <option>Select an authority...</option>
            {Object.values(authorityData).map(authorityDataEntry => {
                return (
                    <option key={authorityDataEntry.authority} value={authorityDataEntry.authority}>
                        {authorityDataEntry.authority}
                    </option>
                );
            })}
        </select>
    );
};

export default AuthoritySelector;