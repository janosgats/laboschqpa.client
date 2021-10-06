import React, {createContext, FC, ReactNode, useEffect, useState} from "react";

export interface IEditorContext {
    /**
     * Tells if the components in the editor should display editing features.
     */
    isEdited: boolean;
    areSubcomponentsEditable: boolean;
    isMuiRteReadonly: boolean;
    setIsMuiRteReadonly: (readonly: boolean) => void;
}

export const EditorContext = createContext<IEditorContext>({
    isEdited: null,
    areSubcomponentsEditable: null,
    isMuiRteReadonly: null,
    setIsMuiRteReadonly: null,
});

interface Props {
    children: ReactNode;
    areSubcomponentsEditable: boolean;
    isEdited: boolean;
}

const EditorContextProvider: FC<Props> = ({children, areSubcomponentsEditable, isEdited}: Props): JSX.Element => {
    const [isMuiRteReadonly, setIsMuiRteReadonly] = useState<boolean>(!areSubcomponentsEditable);

    useEffect(() => {
        setIsMuiRteReadonly(!areSubcomponentsEditable);
    }, [areSubcomponentsEditable])

    const contextValue: IEditorContext = {
        isEdited: isEdited,
        areSubcomponentsEditable: areSubcomponentsEditable,
        isMuiRteReadonly: isMuiRteReadonly,
        setIsMuiRteReadonly: setIsMuiRteReadonly,
    };

    return (
        <EditorContext.Provider value={contextValue}>
            {children}
        </EditorContext.Provider>
    );
};

export default EditorContextProvider;
