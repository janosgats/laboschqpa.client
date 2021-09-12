import {Theme} from "@material-ui/core/styles";
import {alpha} from "@material-ui/core";

export function getStyles(theme: Theme) {
    return {
        objectiveDisplayWrapper:{
            padding: "16px",
            borderRadius: "16px",
            marginTop: "24px",
            backgroundColor: alpha(theme.palette.background.paper, 0.5),
        },

        typeSelectorLabel:{
            marginRight: "8px",
        },

        title:{
            marginLeft: "4px",
        },

        subtitle:{
            textIndent: "50px",
            fontStyle: "oblique",
            fontSize: "small",
        },

        richTextEditor:{
            marginTop: "8px",
            marginBottom: "8px",
        },

        buttonSubmission:{
            marginLeft: "16px",
        },

        buttonScore:{
            marginRight: "16px",
        }

    };
}