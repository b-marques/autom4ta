import React from "react";
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

const re = RegExp(
    [
        "^\\s*([A-Z])\\s*->\\s*",
        "(",
        "((&\\s*)|(([a-z]|[0-9])([A-Z])\\s*)|(([a-z]|[0-9])\\s*))",
        "((\\|\\s*&\\s*)|(\\|\\s*(([a-z]|[0-9])([A-Z])\\s*)|(\\|\\s*([a-z]|[0-9])\\s*)))*",
        ")$"
    ].join("")
);

class GrammarField extends React.Component {
    state = {
        multiline: "",
        helper_text: "",
        error: false
    };

    handleChange = () => event => {
        if (re.test(event.target.value) || event.target.value === "") {
            this.setState({
                multiline: event.target.value,
                helper_text: "",
                error: false
            });
            return this;
        }

        this.setState({
            multiline: event.target.value,
            helper_text: "Invalid input",
            error: true
        });
    };

    render() {
        const { classes } = this.props;
        return (
            <TextField
                id="outlined-multiline-flexible"
                label="Regular Grammar"
                multiline
                error={this.state.error}
                rowsMax="10"
                value={this.state.multiline}
                onChange={this.handleChange()}
                className={classes.textField}
                margin="normal"
                variant="outlined"
                helperText={this.state.helper_text}
                placeholder="S -> a | aS | &"
            />
        );
    }
}

export default withStyles(styles)(GrammarField);
