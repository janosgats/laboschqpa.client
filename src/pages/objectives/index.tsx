import Head from 'next/head'
import {NextPage} from "next";
import React, {useState} from "react";
import ObjectivesPanel from "~/components/ObjectivesPanel";
import {ObjectiveType} from "~/enums/ObjectiveType";

const Index: NextPage = () => {
    const [filteredObjectiveTypes, setFilteredObjectiveTypes]
        = useState<Set<ObjectiveType>>(new Set([ObjectiveType.MAIN_OBJECTIVE, ObjectiveType.PRE_WEEK_TASK]));

    function updateFilteredObjectiveTypes(type: ObjectiveType, shouldDisplay: boolean) {
        if (shouldDisplay) {
            filteredObjectiveTypes.add(type);
        } else {
            filteredObjectiveTypes.delete(type);
        }
        setFilteredObjectiveTypes(new Set(filteredObjectiveTypes));
    }

    return (
        <div>
            <Head>
                <title>Objectives</title>
            </Head>

            <label>Show main objectives: </label>
            <input type="checkbox"
                   checked={filteredObjectiveTypes.has(ObjectiveType.MAIN_OBJECTIVE)}
                   onChange={e => updateFilteredObjectiveTypes(ObjectiveType.MAIN_OBJECTIVE, e.target.checked)}/>
            <br/>
            <label>Show pre-week tasks: </label>
            <input type="checkbox"
                   checked={filteredObjectiveTypes.has(ObjectiveType.PRE_WEEK_TASK)}
                   onChange={e => updateFilteredObjectiveTypes(ObjectiveType.PRE_WEEK_TASK, e.target.checked)}/>
            <br/>

            <ObjectivesPanel filteredObjectiveTypes={Array.from(filteredObjectiveTypes)}/>

        </div>
    )
};

export default Index;
