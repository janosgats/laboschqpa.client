import {Theme} from '@material-ui/core/styles';

export function getStyles(theme: Theme) {
    return {
        typeSelectorLabel: {
            marginRight: '8px',
        },

        title: {
            marginLeft: '4px',
        },

        subtitle: {
            textIndent: '50px',
            fontStyle: 'oblique',
            fontSize: 'small',
        },

        richTextEditor: {
            marginTop: '8px',
            marginBottom: '8px',
        },

        buttonSubmission: {
            marginLeft: '16px',
        },

        buttonScore: {
            marginRight: '16px',
        },

        acceptedObjective: {
            color: '#618833',
        },

        acceptedTitle:{
            marginLeft: '4px',
            color: '#618833',
        },


        acceptedSubtitle:{
            textIndent: '50px',
            fontStyle: 'oblique',
            fontSize: 'small',
            color: '#618833',
        }

        
    };
}
