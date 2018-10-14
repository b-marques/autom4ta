import React from "react";
import { connect } from "react-redux";
import { addLanguage } from "../actions";
import { bindActionCreators } from "redux";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";

import AddIcon from "@material-ui/icons/Add";
import { withStyles } from "@material-ui/core/styles";

const styles = theme => ({
    extendedIcon: {
        marginRight: theme.spacing.unit
    },
    button: {
        margin: theme.spacing.unit
    }
});

class AddLanguage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inputValue: ""
        };
        this.updateInputValue = this.updateInputValue.bind(this);
    }

    updateInputValue(evt) {
        this.setState({
            inputValue: evt.target.value
        });
    }

    render() {
        const { classes } = this.props;
        return (
            <div className="add-lang-container" align="center">
                <TextField
                    id="standard-name"
                    className={classes.textField}
                    margin="normal"
                    type="text"
                    name="new-language-name"
                    value={this.state.inputValue}
                    onChange={this.updateInputValue}
                    placeholder="New Language Name"
                />
                <Button
                    variant="extendedFab"
                    color="primary"
                    aria-label="Add"
                    className={classes.button}
                    onClick={e => {
                        e.preventDefault();
                        this.props.addLanguage(this.state.inputValue);
                    }}
                >
                    <AddIcon className={classes.extendedIcon} />
                    New Language
                </Button>
            </div>
        );
    }
}

const mapDispatchToProps = dispatch => bindActionCreators({ addLanguage }, dispatch);

export default connect(
    null,
    mapDispatchToProps
)(withStyles(styles, { withTheme: true })(AddLanguage));
