import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { selectLanguage, updateGrammar } from "../actions";

import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";

const styles = theme => ({
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: "40vw",
        minWidth: "400px"
    }
});

class LanguageList extends React.Component {
    render() {
        const classes = this.props;
        console.log(
            this.props.reducer.languages[this.props.reducer.selected_language]
                .grammar
        );
        let info;
        let grammar_text = this.props.reducer.languages[
            this.props.reducer.selected_language
        ].grammar.text;

        if (!this.props.reducer.languages.length) {
            info = "Please, add a new language";
        } else {
            info = (
                <div className="language-all-info">
                    <div className="language-name">
                        <p>
                            {
                                this.props.reducer.languages[
                                    this.props.reducer.selected_language
                                ].name
                            }
                        </p>
                    </div>
                    <div className="grammar-input-area">
                        <TextField
                            id="outlined-multiline-flexible"
                            label="Regular Grammar"
                            multiline
                            error={
                                !this.props.reducer.languages[
                                    this.props.reducer.selected_language
                                ].grammar.valid &&
                                this.props.reducer.languages[
                                    this.props.reducer.selected_language
                                ].grammar.text !== ""
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
    bindActionCreators({ selectLanguage, updateGrammar }, dispatch);

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(LanguageList));
