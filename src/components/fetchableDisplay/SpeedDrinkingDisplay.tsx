import React, { useContext, useEffect, useState } from "react";
import { CurrentUserContext } from "~/context/CurrentUserProvider";
import { Authority } from "~/enums/Authority";
import callJsonEndpoint from "~/utils/api/callJsonEndpoint";
import { FetchableDisplay, FetchingTools } from "~/model/FetchableDisplay";
import CreatedEntityResponse from "~/model/CreatedEntityResponse";
import UserInfoService, { Author } from "~/service/UserInfoService";
import UserNameFormatter from "~/utils/UserNameFormatter";
import EventBus from "~/utils/EventBus";
import DateTimeFormatter from "~/utils/DateTimeFormatter";
import {
  SpeedDrinkingCategory,
  speedDrinkingCategoryData,
} from "~/enums/SpeedDrinkingCategory";
import { SpeedDrinking } from "~/model/usergeneratedcontent/SpeedDrinking";
import { isValidNumber } from "~/utils/CommonValidators";
import SpeedDrinkingEditor from "~/components/fetchableDisplay/ui/SpeedDrinkingEditor";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";

export interface SaveSpeedDrinkingCommand {
  drinkerUserId: number;
  time: number;
  category: SpeedDrinkingCategory;
  note: string;
}

export interface SpeedDrinkingDisplayExtraProps {
  /**
   * This should indicate the place if all the entities are shown in a category. Otherwise it's just row number.
   */
  rowNumber?: number;
  showCategory: boolean;
  showName: boolean;
  showTeam: boolean;
}

const SpeedDrinkingDisplay: FetchableDisplay<
  SpeedDrinking,
  SaveSpeedDrinkingCommand,
  SpeedDrinkingDisplayExtraProps
> = (props) => {
  const defaultDrinkerUserId = props.isCreatingNew
    ? null
    : props.existingEntity.drinkerUserId;
  const defaultTime = props.isCreatingNew ? 0 : props.existingEntity.time;
  const defaultCategory = props.isCreatingNew
    ? SpeedDrinkingCategory.BEER
    : props.existingEntity.category;
  const defaultNote = props.isCreatingNew ? "" : props.existingEntity.note;

  const currentUser = useContext(CurrentUserContext);
  const [isEdited, setIsEdited] = useState<boolean>(props.isCreatingNew);
  const [isMetaInfoShown, setIsMetaInfoShown] = useState<boolean>(false);

  const [drinkerUserId, setDrinkerUserId] =
    useState<number>(defaultDrinkerUserId);
  const [time, setTime] = useState<number>(defaultTime);
  const [category, setCategory] =
    useState<SpeedDrinkingCategory>(defaultCategory);
  const [note, setNote] = useState<string>(defaultNote);

  const [author, setAuthor] = useState<Author>();
  const [isAuthorFetchingPending, setIsAuthorFetchingPending] =
    useState<boolean>(false);

  useEffect(() => {
    setDrinkerUserId(defaultDrinkerUserId);
    setTime(defaultTime);
    setCategory(defaultCategory);
    setNote(defaultNote);
  }, [props.existingEntity]);

  function composeSaveSpeedDrinkingCommand(): SaveSpeedDrinkingCommand {
    return {
      drinkerUserId: drinkerUserId,
      time: time,
      category: category,
      note: note,
    };
  }

  function doSave() {
    props.onSave(composeSaveSpeedDrinkingCommand());
  }

  function doCancelEdit() {
    const confirmResult = confirm("Do you want to discard your changes?");
    if (confirmResult) {
      setIsEdited(false);
      setDrinkerUserId(defaultDrinkerUserId);
      setTime(defaultTime);
      setCategory(defaultCategory);
      setNote(defaultNote);
      props.onCancelEditing();
    }
  }

  function doDelete() {
    const surelyDelete: boolean = confirm(
      "Do you want to delete this SpeedDrinking?"
    );
    if (surelyDelete) {
      props.onDelete();
    }
  }

  function fetchAuthor() {
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

  return (
    <>
      {!isEdited && (
        <TableHead>
          <TableCell>
            {isValidNumber(props.rowNumber) && props.rowNumber}
          </TableCell>
          {props.showCategory && (
            <TableCell>
              {
                speedDrinkingCategoryData[props.existingEntity.category]
                  .displayName
              }
            </TableCell>
          )}
          {props.showName && (
            <TableCell>
              {UserNameFormatter.getBasicDisplayName({
                firstName: props.existingEntity.drinkerFirstName,
                lastName: props.existingEntity.drinkerLastName,
                nickName: props.existingEntity.drinkerNickName,
              })}
            </TableCell>
          )}
          {props.showTeam && (
            <TableCell>{props.existingEntity.drinkerTeamName}</TableCell>
          )}
          <TableCell>{props.existingEntity.time}</TableCell>
          <TableCell>{props.existingEntity.note}</TableCell>
          <TableCell>
            {isMetaInfoShown ? (
              <>
                <ul>
                  <li>
                    Created:{" "}
                    {DateTimeFormatter.toFullBasic(
                      props.existingEntity.creationTime
                    )}
                  </li>
                  <li>
                    Last edited:{" "}
                    {DateTimeFormatter.toFullBasic(
                      props.existingEntity.editTime
                    )}
                  </li>
                </ul>
                {author ? (
                  <ul>
                    <li>
                      Created by:{" "}
                      {UserNameFormatter.getBasicDisplayName(author.creator)}
                    </li>
                    <li>
                      Last edited by:{" "}
                      {UserNameFormatter.getBasicDisplayName(author.editor)}
                    </li>
                  </ul>
                ) : (
                  <button
                    onClick={fetchAuthor}
                    disabled={isAuthorFetchingPending}
                  >
                    Show Author
                  </button>
                )}
              </>
            ) : (
              <>
                {DateTimeFormatter.toDay(props.existingEntity.creationTime)}
                {author ? (
                  <button onClick={() => setIsMetaInfoShown(true)}>More</button>
                ) : (
                  {}
                )}
              </>
            )}
          </TableCell>
          {currentUser.hasAuthority(Authority.SpeedDrinkingEditor) && (
            <TableCell>
              <button onClick={() => setIsEdited(true)}>Edit</button>
            </TableCell>
          )}
        </TableHead>
      )}
      {isEdited && (
        <SpeedDrinkingEditor
          isCreatingNew={props.isCreatingNew}
          isApiCallPending={props.isApiCallPending}
          onCancel={doCancelEdit}
          onSave={doSave}
          onDelete={doDelete}
          drinkerUserId={drinkerUserId}
          setDrinkerUserId={setDrinkerUserId}
          time={time}
          setTime={setTime}
          category={category}
          setCategory={setCategory}
          note={note}
          setNote={setNote}
        />
      )}
    </>
  );
};

class FetchingToolsImpl
  implements FetchingTools<SpeedDrinking, SaveSpeedDrinkingCommand>
{
  createNewEntity(command: SaveSpeedDrinkingCommand): Promise<number> {
    return callJsonEndpoint<CreatedEntityResponse>({
      conf: {
        url: "/api/up/server/api/speedDrinking/createNew",
        method: "post",
        data: {
          drinkerUserId: command.drinkerUserId,
          time: command.time,
          category: command.category,
          note: command.note,
        },
      },
    }).then((resp) => resp.data.createdId);
  }

  deleteEntity(id: number): Promise<any> {
    return callJsonEndpoint({
      conf: {
        url: "/api/up/server/api/speedDrinking/delete",
        method: "delete",
        params: {
          id: id,
        },
      },
    });
  }

  editEntity(id: number, command: SaveSpeedDrinkingCommand): Promise<any> {
    return callJsonEndpoint({
      conf: {
        url: "/api/up/server/api/speedDrinking/edit",
        method: "post",
        data: {
          id: id,
          drinkerUserId: command.drinkerUserId,
          time: command.time,
          category: command.category,
          note: command.note,
        },
      },
    });
  }

  fetchEntity(id: number): Promise<SpeedDrinking> {
    return callJsonEndpoint<SpeedDrinking>({
      conf: {
        url: "/api/up/server/api/speedDrinking/display/get",
        method: "get",
        params: {
          id: id,
        },
      },
    }).then((resp) => resp.data);
  }
}

SpeedDrinkingDisplay.fetchingTools = new FetchingToolsImpl();

export default SpeedDrinkingDisplay;
