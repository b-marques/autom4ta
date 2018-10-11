import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
    selectLanguage,
    updateGrammar,
    addState,
    addSymbol,
    setInitial,
    addFinal,
    removeFinal,
    updateTransition,
    determinize,
    minimize,
    union
} from "../actions";

import AddLanguage from "../containers/AddLanguage";
import RemoveLanguage from "../containers/RemoveLanguage";

import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";

import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

import Button from "@material-ui/core/Button";
import Radio from "@material-ui/core/Radio";
import Checkbox from "@material-ui/core/Checkbox";

import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

import Graph from "./Graph";

const styles = theme => ({
    textField: {
        margin: theme.spacing.unit * 3,
        width: "95%"
    },
    paper: {
        width: "98vw",
        margin: theme.spacing.unit
    },
    table: {
        width: "100%"
    },
    head: {
        backgroundColor: "#eb7f00",
        color: theme.palette.common.white
    },
    inputCellState: {
        border: "none"
    },
    inputCellTransition: {
        border: "none"
    },
    buttonsContainer: {
        margin: "auto",
        display: "table",
        padding: theme.spacing.unit
    },
    buttons: {
        display: "table-cell",
        padding: theme.spacing.unit
    }
});

class LanguageList extends React.Component {
    state = {
        determinizeDialogOpen: false,
        determinizeDialogName: "",
        unionDialogOpen: false,
        unionDialogName: "",
        intersectionDialogOpen: false,
        intersectionDialogName: "",
        minimizeDialogOpen: false,
        minimizeDialogName: ""
    };

    tableHeader() {
        let table_header = ["⟶", "Final?", "State"];
        if (this.props.reducer.languages[this.props.reducer.selected_language].fa.alphabet)
            table_header = [
                ...table_header,
                ...this.props.reducer.languages[this.props.reducer.selected_language].fa.alphabet
            ];
        return table_header;
    }

    tableBody() {
        const { classes } = this.props;

        if (
            this.props.reducer.languages[this.props.reducer.selected_language].fa.states === undefined ||
            !this.props.reducer.languages[this.props.reducer.selected_language].fa.states.size
        )
            return;

        return [...this.props.reducer.languages[this.props.reducer.selected_language].fa.states].map((state, id) => {
            return (
                <TableRow key={id + state}>
                    <TableCell component="th" scope="row">
                        <Radio
                            value={state}
                            checked={
                                this.props.reducer.languages[this.props.reducer.selected_language].fa.initial === state
                            }
                            onClick={e => {
                                e.preventDefault();
                                this.props.setInitial(e.target.value);
                            }}
                        />
                    </TableCell>
                    <TableCell component="th" scope="row">
                        <Checkbox
                            checked={this.props.reducer.languages[this.props.reducer.selected_language].fa.finals.has(
                                state
                            )}
                            value={state}
                            onChange={e => {
                                e.preventDefault();
                                if (e.target.checked) {
                                    this.props.addFinal(e.target.value);
                                } else {
                                    this.props.removeFinal(e.target.value);
                                }
                            }}
                        />
                    </TableCell>
                    <TableCell component="th" scope="row">
                        <span className={classes.inputCellState}>{state}</span>
                    </TableCell>
                    {[...this.props.reducer.languages[this.props.reducer.selected_language].fa.alphabet].map(
                        (symbol, id) => {
                            return (
                                <TableCell component="th" scope="row" key={state + symbol + id}>
                                    <input
                                        size={
                                            this.props.reducer.languages[this.props.reducer.selected_language].fa
                                                .transitions[state][symbol].text.length + 1
                                        }
                                        value={
                                            this.props.reducer.languages[this.props.reducer.selected_language].fa
                                                .transitions[state][symbol].text
                                        }
                                        style={
                                            this.props.reducer.languages[
                                                this.props.reducer.selected_language
                                            ].fa.transitions[state][symbol].text.indexOf(" ") === -1
                                                ? { backgroundColor: "#ffdddd" }
                                                : {}
                                        }
                                        className={classes.inputCellTransition}
                                        onChange={e => {
                                            e.target.width = e.target.value.length;
                                            e.target.value = e.target.value.toUpperCase();
                                            this.props.updateTransition(state, e.target.value, symbol);
                                        }}
                                    />
                                </TableCell>
                            );
                        }
                    )}
                </TableRow>
            );
        });
    }

    render() {
        const { classes } = this.props;
        let info;
        let grammar_text;

        if (!this.props.reducer.languages.length) {
            info = "Please, add a new language";
        } else {
            grammar_text = this.props.reducer.languages[this.props.reducer.selected_language].grammar.text;
            info = (
                <div className="language-all-info">
                    <Paper className={classes.paper}>
                        <p>{this.props.reducer.languages[this.props.reducer.selected_language].name}</p>
                    </Paper>

                    <div className="grammar-input-area">
                        <Paper className={classes.paper}>
                            <TextField
                                id="outlined-multiline-flexible"
                                label="Regular Grammar"
                                multiline
                                error={
                                    !this.props.reducer.languages[this.props.reducer.selected_language].grammar.valid &&
                                    this.props.reducer.languages[this.props.reducer.selected_language].grammar.text !==
                                        ""
                                }
                                rowsMax="10"
                                value={grammar_text}
                                onChange={e => {
                                    e.preventDefault();
                                    this.props.updateGrammar(e.target.value);
                                }}
                                className={classes.textField}
                                margin="normal"
                                variant="outlined"
                                placeholder="S -> a | aS | &"
                            />
                        </Paper>
                    </div>
                    <div className="table-input-area">
                        <Paper className={classes.paper}>
                            <Table className={classes.table}>
                                <TableHead>
                                    <TableRow>
                                        {this.tableHeader().map((element, id) => {
                                            return (
                                                <TableCell
                                                    className={classes.head}
                                                    width="12px"
                                                    component="th"
                                                    scope="row"
                                                    key={id}
                                                >
                                                    {element}
                                                </TableCell>
                                            );
                                        })}
                                        <TableCell
                                            width="69px"
                                            className={classes.head}
                                            component="th"
                                            scope="row"
                                            key={"new-symbol-column"}
                                        >
                                            <input
                                                size="12"
                                                maxLength="1"
                                                pattern="[a-z0-9]"
                                                className={classes.inputCellSymbol}
                                                placeholder="Input new symbol"
                                                onChange={e => {
                                                    e.target.value = e.target.value.toLowerCase();
                                                }}
                                                onKeyPress={e => {
                                                    let regex = /[a-z]|[0-9]|&/;
                                                    if (e.key === "Enter" && regex.test(e.target.value)) {
                                                        this.props.addSymbol(e.target.value);
                                                        e.target.value = "";
                                                    }
                                                }}
                                            />
                                            {/*<span> Input new symbol</span>*/}
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {this.tableBody()}
                                    <TableRow key={"new-state-row"}>
                                        <TableCell component="th" scope="row" />
                                        <TableCell component="th" scope="row" />
                                        <TableCell component="th" scope="row">
                                            <input
                                                size="10"
                                                maxLength="1"
                                                placeholder="Input new state."
                                                className={classes.inputCellState}
                                                onChange={e => {
                                                    e.target.value = e.target.value.toUpperCase();
                                                }}
                                                onKeyPress={e => {
                                                    let regex = /[A-Z]/;
                                                    if (e.key === "Enter" && regex.test(e.target.value)) {
                                                        this.props.addState(e.target.value);
                                                        e.target.value = "";
                                                    }
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                            <div className={classes.buttonsContainer}>
                                <div id="determinize-container" className={classes.buttons}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        disabled={
                                            !this.props.reducer.languages[
                                                this.props.reducer.selected_language
                                            ].fa.isFiniteAutomata()
                                        }
                                        onClick={e => {
                                            this.setState({ determinizeDialogOpen: true });
                                        }}
                                    >
                                        Determinize
                                    </Button>
                                    <Dialog
                                        open={this.state.determinizeDialogOpen}
                                        onClose={e => {
                                            this.setState({ determinizeDialogOpen: false });
                                        }}
                                        aria-labelledby="form-dialog-title"
                                    >
                                        <DialogTitle id="form-dialog-title">Determinizing FA</DialogTitle>
                                        <DialogContent>
                                            <DialogContentText>
                                                Please inform a name to the resultant DFA.
                                            </DialogContentText>
                                            <TextField
                                                autoFocus
                                                margin="dense"
                                                id="name"
                                                label="Name"
                                                type="text"
                                                fullWidth
                                                onChange={e => {
                                                    this.setState({ determinizeDialogName: e.target.value });
                                                }}
                                            />
                                        </DialogContent>
                                        <DialogActions>
                                            <Button
                                                onClick={e => {
                                                    this.setState({ determinizeDialogOpen: false });
                                                }}
                                                color="primary"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={e => {
                                                    this.props.determinize(this.state.determinizeDialogName);
                                                    this.setState({ determinizeDialogOpen: false });
                                                }}
                                                color="primary"
                                            >
                                                Confirm
                                            </Button>
                                        </DialogActions>
                                    </Dialog>
                                </div>
                                <div id="union-container" className={classes.buttons}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        disabled={
                                            !this.props.reducer.languages[this.props.reducer.selected_language].fa
                                                .determinized
                                        }
                                        onClick={e => {
                                            this.setState({ unionDialogOpen: true });
                                        }}
                                    >
                                        Union
                                    </Button>
                                    <Dialog
                                        open={this.state.unionDialogOpen}
                                        onClose={e => {
                                            this.setState({ unionDialogOpen: false });
                                        }}
                                        aria-labelledby="form-dialog-title"
                                    >
                                        <DialogTitle id="form-dialog-title">Union of DFA's</DialogTitle>
                                        <DialogContent>
                                            <DialogContentText>Please inform the ID of other DFA.</DialogContentText>
                                            <TextField
                                                autoFocus
                                                margin="dense"
                                                id="name"
                                                label="Name"
                                                type="text"
                                                fullWidth
                                                onChange={e => {
                                                    this.setState({ unionDialogName: e.target.value });
                                                }}
                                            />
                                        </DialogContent>
                                        <DialogActions>
                                            <Button
                                                onClick={e => {
                                                    this.setState({ unionDialogOpen: false });
                                                }}
                                                color="primary"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={e => {
                                                    this.props.union(this.state.unionDialogName);
                                                    this.setState({ unionDialogOpen: false });
                                                }}
                                                color="primary"
                                            >
                                                Confirm
                                            </Button>
                                        </DialogActions>
                                    </Dialog>
                                </div>
                                <div id="intersection-container" className={classes.buttons}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        disabled={
                                            !this.props.reducer.languages[this.props.reducer.selected_language].fa
                                                .determinized
                                        }
                                        onClick={e => {
                                            this.setState({ intersectionDialogOpen: true });
                                        }}
                                    >
                                        Intersection
                                    </Button>
                                    <Dialog
                                        open={this.state.intersectionDialogOpen}
                                        onClose={e => {
                                            this.setState({ intersectionDialogOpen: false });
                                        }}
                                        aria-labelledby="form-dialog-title"
                                    >
                                        <DialogTitle id="form-dialog-title">Intersection of DFA's</DialogTitle>
                                        <DialogContent>
                                            <DialogContentText>Please inform the ID of other DFA.</DialogContentText>
                                            <TextField
                                                autoFocus
                                                margin="dense"
                                                id="name"
                                                label="Name"
                                                type="text"
                                                fullWidth
                                                onChange={e => {
                                                    this.setState({ intersectionDialogName: e.target.value });
                                                }}
                                            />
                                        </DialogContent>
                                        <DialogActions>
                                            <Button
                                                onClick={e => {
                                                    this.setState({ intersectionDialogOpen: false });
                                                }}
                                                color="primary"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={e => {
                                                    this.props.intersection(this.state.intersectionDialogName);
                                                    this.setState({ intersectionDialogOpen: false });
                                                }}
                                                color="primary"
                                            >
                                                Confirm
                                            </Button>
                                        </DialogActions>
                                    </Dialog>
                                </div>
                                <div id="minimize-container" className={classes.buttons}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        disabled={
                                            !this.props.reducer.languages[this.props.reducer.selected_language].fa
                                                .determinized
                                        }
                                        onClick={e => {
                                            this.setState({ minimizeDialogOpen: true });
                                        }}
                                    >
                                        Minimize
                                    </Button>
                                    <Dialog
                                        open={this.state.minimizeDialogOpen}
                                        onClose={e => {
                                            this.setState({ minimizeDialogOpen: false });
                                        }}
                                        aria-labelledby="form-dialog-title"
                                    >
                                        <DialogTitle id="form-dialog-title">Minimization of DFA</DialogTitle>
                                        <DialogContent>
                                            <DialogContentText>
                                                Please inform a name to the resultant DFA.
                                            </DialogContentText>
                                            <TextField
                                                autoFocus
                                                margin="dense"
                                                id="name"
                                                label="Name"
                                                type="text"
                                                fullWidth
                                                onChange={e => {
                                                    this.setState({ minimizeDialogName: e.target.value });
                                                }}
                                            />
                                        </DialogContent>
                                        <DialogActions>
                                            <Button
                                                onClick={e => {
                                                    this.setState({ minimizeDialogOpen: false });
                                                }}
                                                color="primary"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={e => {
                                                    this.props.minimize(this.state.minimizeDialogName);
                                                    this.setState({ minimizeDialogOpen: false });
                                                }}
                                                color="primary"
                                            >
                                                Confirm
                                            </Button>
                                        </DialogActions>
                                    </Dialog>
                                </div>
                                <span className={classes.buttons}>
                                    {this.props.reducer.languages[
                                        this.props.reducer.selected_language
                                    ].fa.isFiniteAutomata()
                                        ? "Valid finite automata"
                                        : "It is not a valid finite automata"}
                                </span>
                            </div>
                        </Paper>
                        <Paper className={classes.paper}>
                            <div id="graph-card">
                                                                {this.props.reducer.languages[
                                    this.props.reducer.selected_language
                                ].fa.isFiniteAutomata()
                                    ? (<Graph fsm={this.props.reducer.languages[
                                    this.props.reducer.selected_language].fa}/>)
                                    : "Waiting for valid automata..."}
                            </div>
                        </Paper>
                    </div>
                </div>
            );
        }

        return (
            <div className="language-list-cotainer">
                {this.props.reducer.languages.map((language, id) => {
                    return (
                        <button
                            key={id}
                            onClick={e => {
                                e.preventDefault();
                                this.props.selectLanguage(id);
                            }}
                        >
                            {language.name} {"ID: " + id}
                        </button>
                    );
                })}
                <AddLanguage />
                <RemoveLanguage />

                <div className="language-detail">{info}</div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ reducer: state.languageReducer });

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            selectLanguage,
            updateGrammar,
            addState,
            addSymbol,
            setInitial,
            addFinal,
            removeFinal,
            updateTransition,
            determinize,
            minimize,
            union
        },
        dispatch
    );

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(LanguageList));
