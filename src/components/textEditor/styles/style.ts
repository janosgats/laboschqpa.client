import {Theme} from "@material-ui/core/styles";
import {alpha} from "@material-ui/core";

export function getStyles(theme: Theme) {
    return {
        richTextEditorPaper: {
            padding: "16px",
            borderRadius: "15px",
            backgroundColor: alpha(theme.palette.background.paper, 0.5),
        }
    };
}