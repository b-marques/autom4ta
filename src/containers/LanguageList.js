import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { addLanguage } from "../actions";
import { removeLanguage } from "../actions";
import { selectLanguage } from "../actions";

import {
    updateGrammar,
    addState,
    addSymbol,
    setInitial,
    addFinal,
    removeFinal,
    updateTransition,
    determinize,
    minimize,
    union,
    intersection,
    updateRE,
    removeState,
    removeSymbol
} from "../actions";

import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";

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

import DeleteIcon from "@material-ui/icons/Delete";
import Grid from "@material-ui/core/Grid";

import Viz from "viz.js";
import { Module, render } from "viz.js/full.render.js";

const styles = theme => ({
    textField: {
        width: "97%",
        margin: theme.spacing.unit
    },
    paper: {
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
    },
    title: {
        padding: theme.spacing.unit,
        paddingTop: theme.spacing.unit * 2
    }
});

class LanguageList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            determinizeDialogOpen: false,
            determinizeDialogName: "",
            unionDialogOpen: false,
            unionDialogName: "",
            intersectionDialogOpen: false,
            intersectionDialogName: "",
            minimizeDialogOpen: false,
            minimizeDialogName: ""
        };
    }

    buildExamples() {
        this.props.addLanguage("Grammar to AFND");
        this.props.updateGrammar(`A -> aB | bA
B -> a | aC | bB
C -> aD | b | bC
D -> aD | bD`);
        this.props.determinize("(ID: 0 -> Determinized)");
        this.props.addLanguage("Aux to UNION");
        this.props.updateGrammar(`A -> aA | bB
B -> aB | b | bC
C -> a | aC | b | bC`);
        this.props.determinize("Aux to UNION");
        this.props.selectLanguage(2);
        this.props.removeLanguage();
        this.props.union(1);
        this.props.determinize("(ID: 3 -> Determinized)");
        this.props.addLanguage("Aux to Minimize");
        this.props.updateGrammar(`A -> 0B | 1 | 1C
B -> 0A | 1 | 1D
C -> 0 | 0E | 1F
D -> 0 | 0E | 1F
E -> 0 | 0E | 1F
F -> 0F | 1F`);
        this.props.determinize("Aux to Minimize");
        this.props.selectLanguage(5);
        this.props.removeLanguage();
        this.props.minimize("(ID: 5 -> Minimal)");
        this.props.addLanguage("Aux to Intersection");
        this.props.updateGrammar(`A -> a | aB | bA
B -> aC | b | bB
C -> aC | bC`);
        this.props.determinize("Aux to Intersection");
        this.props.selectLanguage(7);
        this.props.removeLanguage();
        this.props.addLanguage("Aux to Intersection");
        this.props.updateGrammar(`A -> aA | b | bB
B -> a | aB | bC
C -> aC | bC`);
        this.props.determinize("Aux to Intersection");
        this.props.selectLanguage(8);
        this.props.removeLanguage();
        this.props.intersection(7);
        this.props.addLanguage("RegularExp to DFA");
        this.props.updateRE(
            `(aa|bb|(ab|ba)(aa|bb)*(ab|ba))*a(aa|bb|(ab|ba)(aa|bb)*(ab|ba))*b(aa|bb|(ab|ba)(aa|bb)*(ab|ba))*|(aa|bb|(ab|ba)(aa|bb)*(ab|ba))*b(aa|bb|(ab|ba)(aa|bb)*(ab|ba))*a(aa|bb|(ab|ba)(aa|bb)*(ab|ba))*`
        );
    }

    checkForGraph = () => {
        const viz = new Viz({ Module, render });
        let fa = this.props.reducer.languages[this.props.reducer.selected_language].fa;

        let transitions = "";
        for (let state of fa.states) {
            for (let symbol of fa.alphabet) {
                if (fa.transitions[state][symbol].to.size) {
                    for (let to of fa.transitions[state][symbol].to) {
                        transitions += `${state} -> ${to} [label ="${symbol === "&" ? "\\" + symbol : symbol}"]`;
                        transitions += "\n";
                    }
                }
            }
        }

        let graph = `digraph G {
    rankdir=LR;
    size="8,5"

    node [shape = point]; start

    node [shape = doublecircle];
    ${[...fa.finals].join(" ")}

    node [shape = circle];
    start -> ${fa.initial}
    ${transitions}
}`;

        viz.renderSVGElement(graph)
            .then(function(element) {
                let count = document.getElementById("graphCard").childElementCount;
                if (count === 0) {
                    document.getElementById("graphCard").appendChild(element);
                } else {
                    let item = document.getElementById("graphCard");
                    item.replaceChild(element, item.childNodes[0]);
                }
            })
            .catch(err => {
                console.log(err);
            });
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
                        <Button
                            size="small"
                            aria-label="delete-state"
                            className={classes.button}
                            onClick={e => {
                                e.preventDefault();
                                this.props.removeState(state);
                            }}
                        >
                            <Typography variant="subtitle1">{state}</Typography>
                            <DeleteIcon color="action" />
                        </Button>
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
        let re_text;

        if (!this.props.reducer.languages.length) {
            info = (
                <div>
                    <Typography variant="h6">
                        Please, add a new language OR{" "}
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={e => {
                                e.preventDefault();
                                this.buildExamples();
                            }}
                        >
                            Build Examples
                        </Button>
                    </Typography>
                </div>
            );
        } else {
            grammar_text = this.props.reducer.languages[this.props.reducer.selected_language].grammar.text;
            re_text = this.props.reducer.languages[this.props.reducer.selected_language].re.text;
            info = (
                <div className="language-all-info">
                    <Grid container spacing={8} alignItems="stretch">
                        <Grid item xs={6}>
                            <div className="grammar-input-area">
                                <Paper className={classes.paper}>
                                    <TextField
                                        id="outlined-multiline-flexible"
                                        label="Regular Grammar"
                                        multiline
                                        error={
                                            !this.props.reducer.languages[this.props.reducer.selected_language].grammar
                                                .valid &&
                                            this.props.reducer.languages[this.props.reducer.selected_language].grammar
                                                .text !== ""
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
                        </Grid>
                        <Grid item xs={6}>
                            <div className="re-input-area">
                                <Paper className={classes.paper}>
                                    <TextField
                                        id="outlined-multiline-flexible2"
                                        label="Regular Expression"
                                        multiline
                                        error={
                                            !this.props.reducer.languages[this.props.reducer.selected_language].re
                                                .valid &&
                                            this.props.reducer.languages[this.props.reducer.selected_language].re
                                                .text !== ""
                                        }
                                        rowsMax="10"
                                        value={re_text}
                                        onChange={e => {
                                            e.preventDefault();
                                            this.props.updateRE(e.target.value);
                                        }}
                                        className={classes.textField}
                                        margin="normal"
                                        variant="outlined"
                                        placeholder="(a|b)*abb"
                                    />
                                </Paper>
                            </div>
                        </Grid>
                        <Grid item xs={12}>
                            <div className="table-input-area">
                                <Paper className={classes.paper}>
                                    <Typography variant="h5" className={classes.title}>
                                        Finite Automata - Transition table
                                    </Typography>
                                    <Table className={classes.table}>
                                        <TableHead>
                                            <TableRow>
                                                {this.tableHeader().map((element, id) => {
                                                    return id < 3 ? (
                                                        <TableCell
                                                            className={classes.head}
                                                            width="12px"
                                                            component="th"
                                                            scope="row"
                                                            key={id}
                                                        >
                                                            {element}
                                                        </TableCell>
                                                    ) : (
                                                        <TableCell
                                                            className={classes.head}
                                                            width="12px"
                                                            component="th"
                                                            scope="row"
                                                            key={id}
                                                        >
                                                            {element}
                                                            <Button
                                                                size="small"
                                                                aria-label="delete-state"
                                                                className={classes.button}
                                                                onClick={e => {
                                                                    e.preventDefault();
                                                                    this.props.removeSymbol(element);
                                                                }}
                                                            >
                                                                <DeleteIcon color="action" />
                                                            </Button>
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
                                                            this.checkForGraph();
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
                                                    !this.props.reducer.languages[this.props.reducer.selected_language]
                                                        .fa.determinized
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
                                                    <DialogContentText>
                                                        Please inform the ID of other DFA.
                                                    </DialogContentText>
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
                                                            this.checkForGraph();
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
                                                    !this.props.reducer.languages[this.props.reducer.selected_language]
                                                        .fa.determinized
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
                                                    <DialogContentText>
                                                        Please inform the ID of other DFA.
                                                    </DialogContentText>
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
                                                            this.checkForGraph();
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
                                                    !this.props.reducer.languages[this.props.reducer.selected_language]
                                                        .fa.determinized
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
                                                            this.checkForGraph();
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
                            </div>
                        </Grid>
                        <Grid item xs={12}>
                            <Paper className={classes.paper}>
                                <Typography variant="h5" className={classes.title}>
                                    Graphical Representation
                                </Typography>
                                <Divider />
                                <div id="graphCard">
                                    {this.props.reducer.languages[
                                        this.props.reducer.selected_language
                                    ].fa.isFiniteAutomata() ? (
                                        this.checkForGraph()
                                    ) : (
                                        <div className={classes.textField}>Waiting for valid automata...</div>
                                    )}
                                </div>
                            </Paper>
                        </Grid>
                    </Grid>
                </div>
            );
        }

        return <div className="language-detail">{info}</div>;
    }
}

const mapStateToProps = state => ({ reducer: state.languageReducer });

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            updateGrammar,
            addState,
            addSymbol,
            setInitial,
            addFinal,
            removeFinal,
            updateTransition,
            determinize,
            minimize,
            union,
            intersection,
            updateRE,
            removeState,
            removeSymbol,
            addLanguage,
            removeLanguage,
            selectLanguage
        },
        dispatch
    );

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles, { withTheme: true })(LanguageList));
