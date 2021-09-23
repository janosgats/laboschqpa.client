import { Theme } from "@material-ui/core/styles";
import { alpha } from "@material-ui/core";

export function getStyles(theme: Theme) {
    return { 

        tableRow: {
            '&:hover': {
                cursor: "pointer",
                backgroundColor: alpha(theme.palette.background.paper, 1),
            },
        },
    }
}