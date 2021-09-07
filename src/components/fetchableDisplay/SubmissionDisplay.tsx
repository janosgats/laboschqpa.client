import React, { useContext, useEffect, useState } from "react";
import { CurrentUserContext } from "~/context/CurrentUserProvider";
import RichTextEditor from "~/components/textEditor/RichTextEditor";
import MuiRteUtils from "~/utils/MuiRteUtils";
import callJsonEndpoint from "~/utils/api/callJsonEndpoint";
import { FetchableDisplay, FetchingTools } from "~/model/FetchableDisplay";
import CreatedEntityResponse from "~/model/CreatedEntityResponse";
import UserInfoService, { Author } from "~/service/UserInfoService";
import UserNameFormatter from "~/utils/UserNameFormatter";
import EventBus from "~/utils/EventBus";
import DateTimeFormatter from "~/utils/DateTimeFormatter";
import { Submission } from "~/model/usergeneratedcontent/Submission";
import { TeamRole } from "~/enums/TeamRole";
import ApiErrorDescriptorException from "~/exception/ApiErrorDescriptorException";
import {
  submission_OBJECTIVE_DEADLINE_HAS_PASSED,
  submission_OBJECTIVE_IS_NOT_SUBMITTABLE,
} from "~/enums/ApiErrors";
import { getSurelyDate } from "~/utils/DateHelpers";
import { Authority } from "~/enums/Authority";
import Scorer from "~/components/Scorer";
import useAttachments, { UsedAttachments } from "~/hooks/useAttachments";
import AttachmentPanel from "~/components/file/AttachmentPanel";
import { Box, Button, ButtonGroup, Collapse, createStyles, DialogContent, DialogContentText, Grid, IconButton, makeStyles, Paper, Theme, Typography } from "@material-ui/core";
import SaveIcon from '@material-ui/icons/Save';
import DeleteIcon from '@material-ui/icons/Delete';
import CloseIcon from '@material-ui/icons/Close';
import EditIcon from '@material-ui/icons/Edit';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import {styles} from'~/components/fetchableDisplay/styles/SubmissionDisplayStyle'

const useStyles = makeStyles((theme: Theme) =>
  createStyles(styles)
)

export interface SaveSubmissionCommand {
  /**
   * Only needed when creating new submission
   */
  objectiveId?: number;

  content: string;
  attachments: number[];
}

export interface SubmissionDisplayExtraProps {
  creationObjectiveId?: number;
  creationObjectiveTitle?: string;
  creationTeamName?: string;

  showObjectiveTitle: boolean;
  showTeamName: boolean;
}

const SubmissionDisplay: FetchableDisplay<
  Submission,
  SaveSubmissionCommand,
  SubmissionDisplayExtraProps
> = (props) => {
  const objectiveId = props.isCreatingNew
    ? props.creationObjectiveId
    : props.existingEntity.objectiveId;
  const objectiveTitle = props.isCreatingNew
    ? props.creationObjectiveTitle
    : props.existingEntity.objectiveTitle;
  const teamName = props.isCreatingNew
    ? props.creationTeamName
    : props.existingEntity.teamName;
  const defaultContent = props.isCreatingNew
    ? MuiRteUtils.emptyEditorContent
    : props.existingEntity.content;
  const defaultAttachments = props.isCreatingNew
    ? []
    : props.existingEntity.attachments;

  const currentUser = useContext(CurrentUserContext);
  const [isEdited, setIsEdited] = useState<boolean>(props.isCreatingNew);
  const [resetTrigger, setResetTrigger] = useState<number>(1);

  const [isScorerOpen, setIsScorerOpen] = useState<boolean>(false);

  const [content, setContent] = useState<string>(defaultContent);
  const usedAttachments: UsedAttachments = useAttachments(defaultAttachments);

  const [author, setAuthor] = useState<Author>();
  const [isAuthorFetchingPending, setIsAuthorFetchingPending] =
    useState<boolean>(false);

  useEffect(() => {
    setContent(defaultContent);
    usedAttachments.reset(defaultAttachments);
  }, [props.existingEntity]);

  function composeSaveSubmissionCommand(): SaveSubmissionCommand {
    return {
      objectiveId: objectiveId,
      content: content,
      attachments: usedAttachments.firmAttachmentIds,
    };
  }

  function doSave() {
    if (usedAttachments.attachmentsUnderUpload.length > 0) {
      EventBus.notifyWarning(
        "Please wait until all the attachments are uploaded!",
        "You cannot save yet"
      );
      return;
    }

    props.onSave(composeSaveSubmissionCommand()).catch((e) => {
      if (e instanceof ApiErrorDescriptorException) {
        if (submission_OBJECTIVE_DEADLINE_HAS_PASSED.is(e.apiErrorDescriptor)) {
          EventBus.notifyWarning(
            "The deadline of this objective has already passed",
            "Cannot submit"
          );
        } else if (
          submission_OBJECTIVE_IS_NOT_SUBMITTABLE.is(e.apiErrorDescriptor)
        ) {
          EventBus.notifyWarning(
            "This objective is not open for manual submissions",
            "Cannot submit"
          );
        }
      }
    });
  }

  function doCancelEdit() {

    setIsEdited(false);
    setResetTrigger(resetTrigger + 1);
    setContent(defaultContent);
    usedAttachments.reset(defaultAttachments);
    props.onCancelEditing();

  }

  function doDelete() {
    const surelyDelete: boolean = confirm(
      "Do you want to delete this Submission?"
    );
    if (surelyDelete) {
      props.onDelete();
    }
  }

  function fetchAuthor() {
    if (showAuthor) {
      return setShowAuthor(false);
    }
    setShowAuthor(true);
    if (author) return;


    setIsAuthorFetchingPending(true);
    UserInfoService.getAuthor(
      props.existingEntity.creatorUserId,
      props.existingEntity.editorUserId,
      false
    )
      .then((value) => setAuthor(value))
      .catch(() => EventBus.notifyError("Error while loading Author"))
      .finally(() => setIsAuthorFetchingPending(false));
  }

  function canEditSubmission(): boolean {
    if (!currentUser.isMemberOrLeaderOfTeam(props.existingEntity.teamId)) {
      return false;
    }
    if (!props.existingEntity.objectiveSubmittable) {
      return false;
    }
    if (
      getSurelyDate(props.existingEntity.objectiveDeadline).getTime() <
      new Date().getTime()
    ) {
      return false;
    }

    return (
      currentUser.getUserInfo().teamRole == TeamRole.LEADER ||
      currentUser.getUserInfo().userId === props.existingEntity.creatorUserId
    );
  }

  const [showAuthor, setShowAuthor] = useState<boolean>(false);

  const classes = useStyles();

  return (
    <Paper
      className={classes.submissionDisplayContainer}
      variant="outlined"
      elevation={3}
    >
      <Grid
          container
          alignItems="center"
          justify="space-between"
          className={classes.header}>

      
      {props.existingEntity.teamName && (
        <Typography variant="h6">Beadta <b><i>{props.existingEntity.teamName}</i></b> csapata.</Typography>
      )}

      {!isEdited && canEditSubmission() && (
        <
        >

          <IconButton
            onClick={() => setIsEdited(true)}
          >
            <EditIcon
              color="action"
            />
          </IconButton>
        </>
      )}

      {isEdited && !props.isCreatingNew && (
        <>
          <ButtonGroup
            variant="text"
            size="large"
          >
            <IconButton
              onClick={doSave}
              disabled={props.isApiCallPending}
            >
              <SaveIcon
                color="primary"
              />
            </IconButton>
            <IconButton
              onClick={doDelete}
              disabled={props.isApiCallPending}

            >
              <DeleteIcon
                color="secondary"
              />
            </IconButton>
            <IconButton
              onClick={doCancelEdit}
              disabled={props.isApiCallPending}
            >
              <CloseIcon
                color="action"
              />
            </IconButton>
          </ButtonGroup>
        </>
      )}
      </Grid>

      <RichTextEditor
        isEdited={isEdited}
        readOnlyControls={props.isApiCallPending}
        defaultValue={defaultContent}
        resetTrigger={resetTrigger}
        onChange={(data) => setContent(data)}
        usedAttachments={usedAttachments}
      />

      <AttachmentPanel
        usedAttachments={usedAttachments}
        isEdited={isEdited}
      />

      {isEdited && (
        <>
          {props.isCreatingNew && (
            <Button
              size="large"
              variant="contained"
              onClick={doSave}
              disabled={props.isApiCallPending}
              color="primary"
              fullWidth
            >
              Beadás
            </Button>
          )}
        </>
      )}
      {!isEdited && (
        <>
          {currentUser.hasAuthority(Authority.TeamScorer) && (
            <Button
              size="large"
              variant="contained"
              onClick={() => setIsScorerOpen(true)}
              color="primary"
              fullWidth
            >
              Pontozás
            </Button>
          )}

          {isScorerOpen && (
            <Scorer
              defaultObjectiveId={props.existingEntity.objectiveId}
              defaultTeamId={props.existingEntity.teamId}
              onClose={() => setIsScorerOpen(false)}
            />
          )}



          <Grid
            container
            direction="row"
            alignItems="center"
            justify="space-between"
          >
            {props.existingEntity.creationTime === props.existingEntity.editTime ? (
              <Typography variant="caption" >Posztolva: {DateTimeFormatter.toFullBasic(props.existingEntity.creationTime)}</Typography>
            ) :
              <Typography variant="caption">Módosítva: {DateTimeFormatter.toFullBasic(props.existingEntity.editTime)}</Typography>
            }
            <IconButton
              onClick={fetchAuthor}
              disabled={isAuthorFetchingPending}
            >
              <InfoOutlinedIcon
                color="secondary"
              />
            </IconButton>
          </Grid>

          {author && (
            <Collapse in={showAuthor}>
              <Grid
                container
                direction="column"
              >
                <Grid
                  container
                  direction="row"
                  alignItems="center"
                  justify="space-between"
                >
                  <Typography variant="caption">Posztolta:{" "}
                    {UserNameFormatter.getBasicDisplayName(author.creator)}
                  </Typography>
                  <Typography variant="caption">
                    Posztolva:{" "}
                    {DateTimeFormatter.toFullBasic(
                      props.existingEntity.creationTime
                    )}
                  </Typography>
                </Grid>
                <Grid
                  container
                  direction="row"
                  alignItems="center"
                  justify="space-between"
                >
                  <Typography variant="caption">Módosította:{" "}
                    {UserNameFormatter.getBasicDisplayName(author.editor)}
                  </Typography>
                  <Typography variant="caption">
                    Módosítva:{" "}
                    {DateTimeFormatter.toFullBasic(props.existingEntity.editTime)}
                  </Typography>
                </Grid>
              </Grid>
            </Collapse>
          )}
        </>
      )}


    </Paper>
  );
};

class FetchingToolsImpl
  implements FetchingTools<Submission, SaveSubmissionCommand>
{
  createNewEntity(command: SaveSubmissionCommand): Promise<number> {
    return callJsonEndpoint<CreatedEntityResponse>({
      conf: {
        url: "/api/up/server/api/submission/createNew",
        method: "post",
        data: {
          objectiveId: command.objectiveId,
          content: command.content,
          attachments: command.attachments,
        },
      },
    }).then((resp) => resp.data.createdId);
  }

  deleteEntity(id: number): Promise<any> {
    return callJsonEndpoint({
      conf: {
        url: "/api/up/server/api/submission/delete",
        method: "delete",
        params: {
          id: id,
        },
      },
    });
  }

  editEntity(id: number, command: SaveSubmissionCommand): Promise<any> {
    return callJsonEndpoint({
      conf: {
        url: "/api/up/server/api/submission/edit",
        method: "post",
        data: {
          id: id,
          content: command.content,
          attachments: command.attachments,
        },
      },
    });
  }

  fetchEntity(id: number): Promise<Submission> {
    return callJsonEndpoint<Submission>({
      conf: {
        url: "/api/up/server/api/submission/submission",
        method: "get",
        params: {
          id: id,
        },
      },
    }).then((resp) => resp.data);
  }
}

SubmissionDisplay.fetchingTools = new FetchingToolsImpl();

export default SubmissionDisplay;
