import {Theme} from "@material-ui/core/styles";
import {alpha} from "@material-ui/core";

export function getStyles(theme: Theme) {
    return {
        programDisplayWrapper:{
            padding: "16px",
            borderRadius: "16px",
            marginTop: "24px",
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
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