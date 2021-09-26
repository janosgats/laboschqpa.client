import {useContext} from 'react';
import {CurrentUser, CurrentUserContext} from "~/context/CurrentUserProvider";

export default function useCurrentUser(): CurrentUser {
    return useContext(CurrentUserContext);
}