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
    updateTransition
} from "../actions";

import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";

import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

import Radio from "@material-ui/core/Radio";
import Checkbox from "@material-ui/core/Checkbox";

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
    }
});

class LanguageList extends React.Component {
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

        const transitions = state => {
            let data = [];
            for (let symbol in [...this.props.reducer.languages[this.props.reducer.selected_language].fa.alphabet]) {
                let states_to = [];
                for (let t in this.props.reducer.languages[this.props.reducer.selected_language].fa.transitions) {
                    if (
                        this.props.reducer.languages[this.props.reducer.selected_language].fa.transitions[t].from ===
                            state &&
                        this.props.reducer.languages[this.props.reducer.selected_language].fa.transitions[t].when ===
                            [...this.props.reducer.languages[this.props.reducer.selected_language].fa.alphabet][symbol]
                    ) {
                        states_to = [
                            ...states_to,
                            this.props.reducer.languages[this.props.reducer.selected_language].fa.transitions[t].to
                        ];
                    }
                }
                if (!states_to.length) states_to = ["-"];
                data = [...data, states_to];
            }
            return data;
        };

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
                                console.log(
                                    this.props.reducer.languages[this.props.reducer.selected_language].fa.finals
                                );
                            }}
                        />
                    </TableCell>
                    <TableCell component="th" scope="row">
                        <input defaultValue={state} className={classes.inputCellState} />
                    </TableCell>
                    {transitions(state).map((data, id) => {
                        return (
                            <TableCell component="th" scope="row" key={id}>
                                <input
                                    onBlur={e => {
                                        e.target.value = data.join(", ");
                                    }}
                                    onChange={e => {
                                        e.target.value = e.target.value.toUpperCase();
                                    }}
                                    onKeyPress={e => {
                                        let regex = /^(([ ]*[ -][ ]*)|(([ ]*([A-Z])[ ]*)([,]([ ]*([A-Z])[ ]*))*))$/;
                                        if (e.key === "Enter" && regex.test(e.target.value)) {
                                            this.props.updateTransition(state, e.target.value, id);
                                        }
                                    }}
                                />
                            </TableCell>
                        );
                    })}
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
                                                <TableCell className={classes.head} component="th" scope="row" key={id}>
                                                    {element}
                                                </TableCell>
                                            );
                                        })}
                                        <TableCell
                                            className={classes.head}
                                            component="th"
                                            scope="row"
                                            key={"new-symbol-column"}
                                        >
                                            <input
                                                maxLength="1"
                                                pattern="[a-z0-9]"
                                                placeholder="Input new symbol."
                                                className={classes.inputCellSymbol}
                                                onChange={e => {
                                                    e.target.value = e.target.value.toLowerCase();
                                                }}
                                                onKeyPress={e => {
                                                    let regex = /[a-z]|[0-9]/;
                                                    if (e.key === "Enter" && regex.test(e.target.value)) {
                                                        this.props.addSymbol(e.target.value);
                                                        e.target.value = "";
                                                    }
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {this.tableBody()}
                                    <TableRow key={"new-state-row"}>
                                        <TableCell component="th" scope="row">
                                            <input
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
                            {language.name} {id}
                        </button>
                    );
                })}
                <div className="language-detail">{info}</div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ reducer: state.languageReducer });

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        { selectLanguage, updateGrammar, addState, addSymbol, setInitial, addFinal, removeFinal, updateTransition },
        dispatch
    );

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(LanguageList));
