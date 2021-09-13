import {Theme} from '@material-ui/core/styles';

export function getStyles(theme: Theme) {
    return {
        richTextEditorPaper: {
            paddingLeft: '16px',
            paddingRight: '16px',
            borderRadius: '4px',
            //backgroundColor: alpha(theme.palette.background.paper, 0.5),
        },
    };
}
