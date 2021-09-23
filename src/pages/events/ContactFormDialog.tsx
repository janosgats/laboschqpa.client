import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField} from '@material-ui/core';
import React, {ReactElement, useState} from 'react';
import {isValidEmail} from '~/utils/CommonValidators';

export interface ContactInfo {
    name: string;
    email: string;
    phone: string;
}

interface Props {
    onSuccess: (ContactInfo) => void;
    onClose: () => void;
}

export default function ContactFormDialog({onClose, onSuccess}: Props): ReactElement {
    const [state, setState] = useState<ContactInfo>({
        email: '',
        name: '',
        phone: '',
    });

    const handleChange = (event) => setState((s) => ({...s, [event.target.name]: event.target.value}));

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!state.name) return;
        if (!state.phone) return;
        if (!state.email) return;
        if (!isValidEmail(state.email)) return;

        onSuccess(state);
    };

    return (
        <Dialog open={true} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Kapcsolattartó adatai</DialogTitle>
                <DialogContent>
                    <DialogContentText>A csapatos részvételhez meg kell adni egy kapcsolattartót!</DialogContentText>
                    <TextField
                        required
                        onChange={handleChange}
                        value={state.name}
                        autoFocus
                        name="name"
                        margin="dense"
                        id="name"
                        label="Név"
                        type="text"
                        fullWidth
                        variant="filled"
                    />
                    <TextField
                        required
                        onChange={handleChange}
                        value={state.email}
                        name="email"
                        margin="dense"
                        id="email"
                        label="Email"
                        type="email"
                        fullWidth
                        variant="filled"
                    />
                    <TextField
                        required
                        onChange={handleChange}
                        value={state.phone}
                        name="phone"
                        margin="dense"
                        id="phone"
                        label="Telefon"
                        type="phone"
                        fullWidth
                        variant="filled"
                    />
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="secondary" onClick={onClose}>
                        Mégsem
                    </Button>
                    <Button type="submit" variant="contained" color="primary">
                        Subscribe
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
