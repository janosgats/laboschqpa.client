import React, {FC} from "react";
import AppNotificationEventDisplay from "~/components/eventDisplays/AppNotificationEventDisplay";
import ExceptionEventDisplay from "~/components/eventDisplays/ExceptionEventDisplay";


const EventDisplayContainer: FC = () => {
    return (<>
        <AppNotificationEventDisplay/>
        <ExceptionEventDisplay/>
    </>);
};

export default EventDisplayContainer;
