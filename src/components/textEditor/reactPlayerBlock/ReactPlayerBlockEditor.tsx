import React, {FC, useEffect, useState} from 'react'
import {ReactPlayerBlockSpec} from "~/components/textEditor/reactPlayerBlock/ReactPlayerBlock";
import {
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    FormControlLabel,
    Grid,
    GridJustification,
    TextField,
    Typography,
    useTheme
} from "@material-ui/core";
import {isValidNonEmptyString} from "~/utils/CommonValidators";

interface Props {
    value: ReactPlayerBlockSpec;
    onClose: () => void;
    onEdit: (spec: ReactPlayerBlockSpec) => void;
    isOpen: boolean;
}

const allowedGridJustifications: GridJustification[] = ['flex-start', 'center', 'flex-end'];

function getValidGridJustification(wantedJustification: any) {
    return allowedGridJustifications.includes(wantedJustification as GridJustification) ? wantedJustification : 'center';
}

export const ReactPlayerBlockEditor: FC<Props> = (props) => {
    const theme = useTheme();

    const [url, setUrl] = useState<string>();
    const [hideControls, setHideControls] = useState<boolean>();
    const [width, setWidth] = useState<number>();
    const [height, setHeight] = useState<number>();
    const [justification, setJustification] = useState<string>();

    function handleEdit(): void {
        props.onEdit({
            url: url,
            hideControls: hideControls,
            width: width,
            height: height,
            justification: getValidGridJustification(justification),
        });
    }

    useEffect(() => {
        if (props.isOpen) {
            setUrl(String(props.value.url) ?? '');
            setHideControls(!!props.value.hideControls);
            setWidth(Number.parseInt(props.value.width as any) ?? 512);
            setHeight(Number.parseInt(props.value.height as any) ?? 288);
            setJustification(getValidGridJustification(props.value.justification));
        }
    }, [props.isOpen])

    function isFormValid() {
        return isValidNonEmptyString(url) && width > 0 && height > 0;
    }

    return (
        <Dialog open={props.isOpen} onClose={props.onClose}>
            <DialogContent>
                <Typography variant="h6">Videó beágyazása</Typography>
                <p>Támogatott platformok: YouTube, Facebook, SoundCloud, Streamable, Vidme,
                    Vimeo, Wistia, Twitch, DailyMotion, Vidyard, és fájlok.</p>

                <Grid container direction="column" spacing={2}>
                    <Grid item>
                        <TextField
                            fullWidth
                            variant="outlined"
                            label="Videó URL"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            autoFocus
                            error={!isValidNonEmptyString(url)}
                        />
                    </Grid>
                    <Grid item container direction="row" justify="space-between">
                        <Grid item>
                            <TextField
                                type="number"
                                variant="outlined"
                                label="Szélesség"
                                value={width}
                                onChange={(e) => setWidth(Number.parseInt(e.target.value as any))}
                                style={{margin: theme.spacing(1)}}
                            />
                        </Grid>
                        <Grid item>
                            <TextField
                                type="number"
                                variant="outlined"
                                label="Magasság"
                                value={height}
                                onChange={(e) => setHeight(Number.parseInt(e.target.value as any))}
                                style={{margin: theme.spacing(1)}}
                            />
                        </Grid>
                    </Grid>
                    <Grid item>
                        <TextField
                            fullWidth
                            variant="outlined"
                            label="Igazítás (flex-start / center / flex-end)"
                            value={justification}
                            onChange={(e) => setJustification(e.target.value)}
                        />
                    </Grid>
                    <Grid item>
                        <FormControlLabel
                            control={
                                <Checkbox checked={hideControls}
                                          onChange={(e) => setHideControls(e.target.checked)}
                                          color="primary"/>
                            }
                            labelPlacement="start"
                            label="Kezelőszervek elrejtése"
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose} color="secondary">
                    Cancel
                </Button>
                <Button onClick={handleEdit} color="primary" disabled={!isFormValid()}>
                    Apply
                </Button>
            </DialogActions>
        </Dialog>
    )
}