import React, {FC} from 'react'
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';
import {Backdrop, Fade, Modal} from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        modal: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        paper: {
            cursor: 'pointer',
            boxShadow: theme.shadows[5],
            padding: 0,
            outline: 0,
        },
    }),
);

interface Props {
    isOpen: boolean;
    onClose: () => void;
    src: string;
}

const FullScreenImageModal: FC<Props> = (props) => {
    const classes = useStyles();
    return (
        <Modal
            className={classes.modal}
            open={props.isOpen}
            onClose={() => props.onClose()}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 500,
            }}
        >
            <Fade in={props.isOpen}>
                <div className={classes.paper} onClick={() => props.onClose()}>
                    <img src={props.src}
                         alt="Couldn't load image :/"
                         style={{maxWidth: '95vw', maxHeight: '95vh', margin: 7}}/>
                </div>
            </Fade>
        </Modal>
    );
}

export default FullScreenImageModal;