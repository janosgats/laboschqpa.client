import React, {FC} from "react";
import {Button, Dialog, DialogContent, Grid,} from "@material-ui/core";
import useEndpoint, {UsedEndpoint} from "~/hooks/useEndpoint";
import {isValidNumber} from "~/utils/CommonValidators";
import {ObjectiveDisplayContainer} from "~/components/fetchableDisplay/FetchableDisplayContainer";
import Spinner from "~/components/Spinner";
import {Objective} from "~/model/usergeneratedcontent/Objective";

interface Props {
    onClose: () => void;
    isOpen: boolean;
    objectiveId: number;
}

const ObjectiveDetailsDialog: FC<Props> = (props) => {

    const usedEndpoint: UsedEndpoint<Objective> = useEndpoint<Objective>({
        conf: {
            url: "/api/up/server/api/objective/objective",
            params: {
                id: props.objectiveId,
            },
        },
        deps: [props.objectiveId],
        enableRequest: props.isOpen && isValidNumber(props.objectiveId),
    });

    return (
        <Dialog open={props.isOpen} onClose={() => props.onClose()} fullWidth >
            <DialogContent>
                {usedEndpoint.pending && <Spinner/>}
                {usedEndpoint.failed && (
                    <>
                        <p>Error while fetching objective :'(</p>
                        <Button onClick={() => usedEndpoint.reloadEndpoint()}>Retry</Button>
                    </>
                )}

                {usedEndpoint.succeeded && (
                    <>
                        <Grid container justify="center" direction="column" spacing={2}>
                            <Grid item container justify="center">
                                <ObjectiveDisplayContainer
                                    overriddenBeginningEntity={usedEndpoint.data}
                                    shouldCreateNew={false}
                                    displayExtraProps={{
                                        hideScorerButton: true,
                                        hideShowSubmissionsButton: true,
                                    }}
                                />
                            </Grid>

                        </Grid>
                    </>

                )}
            </DialogContent>
        </Dialog>
    );
};

export default ObjectiveDetailsDialog;
