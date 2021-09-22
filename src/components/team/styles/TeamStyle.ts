import { Theme } from "@material-ui/core/styles";
import { alpha } from "@material-ui/core";

export function getStyles(theme: Theme) {
    return {

        teamPaper: {
            padding: "16px",
            borderRadius: "16px",
            backgroundColor: alpha(theme.palette.background.paper, 0.5),
            minHeight: "70rem",
        },

        listHover:{  
            '&:hover':{
                backgroundColor: alpha(theme.palette.background.paper, 0.75),
                cursor: "pointer",
            },
        },

        requestToTeamButtons: {

        },

        tableContainer: {
            borderRadius: "16px",
            padding: "16px"
        },


        tableRow: {
            '&:hover': {
                cursor: "pointer",
            },
        },
    };
}
