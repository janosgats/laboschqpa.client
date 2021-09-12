import {Theme} from "@material-ui/core/styles";
import {alpha} from "@material-ui/core";

export function getStyles(theme: Theme) {
    return {
        newsDisplayWrapper: {
            padding: "16px",
            borderRadius: "16px",
            marginTop: "24px",
            backgroundColor: alpha(theme.palette.background.paper, 0.5),
        },
        newsHeader: {
            marginBottom: '8px',
        },
    };
}