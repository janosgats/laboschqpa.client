import React, {FC} from "react";
import AppNotificationEventDisplay from "~/components/eventDisplay/AppNotificationEventDisplay";
import ExceptionEventDisplay from "~/components/eventDisplay/ExceptionEventDisplay";


const EventDisplayContainer: FC = () => {
    return (<>
        <AppNotificationEventDisplay/>
        <ExceptionEventDisplay/>
    </>);
};

export default EventDisplayContainer;
