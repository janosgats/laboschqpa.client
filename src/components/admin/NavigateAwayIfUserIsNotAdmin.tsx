import React, {FC, useContext, useEffect} from "react";
import {Authority} from "~/enums/Authority";
import {useRouter} from "next/router";
import {CurrentUserContext} from "~/context/CurrentUserProvider";


const NavigateAwayIfUserIsNotAdmin: FC = () => {
    const router = useRouter();
    const currentUser = useContext(CurrentUserContext);

    useEffect(() => {
        if (!currentUser.getUserInfo()) {
            return;
        }
        if (!currentUser.hasAuthority(Authority.Admin)) {
            router.push('/');
        }
    }, [!!currentUser.getUserInfo(), currentUser.hasAuthority(Authority.Admin)]);

    return <></>;
};

export default NavigateAwayIfUserIsNotAdmin;