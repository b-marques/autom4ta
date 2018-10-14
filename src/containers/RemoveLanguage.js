import React from "react";
import { connect } from "react-redux";
import { removeLanguage } from "../actions";
import { bindActionCreators } from "redux";
import Button from "@material-ui/core/Button";
import DeleteIcon from "@material-ui/icons/Delete";
import { withStyles } from "@material-ui/core/styles";

const styles = theme => ({
    extendedIcon: {
        marginRight: theme.spacing.unit
    },
    button: {
        backgroundColor: "#eb7f00",
        color: "white",
        margin: theme.spacing.unit
    }
});

class RemoveLanguage extends React.Component {
    render() {
        const { classes } = this.props;
        return (
            <div className="rm-lang-container" align="center">
                <Button
                    variant="extendedFab"
                    aria-label="Add"
                    className={classes.button}
                    onClick={e => {
                        e.preventDefault();
                        this.props.removeLanguage();
                    }}
                >
                    <DeleteIcon className={classes.extendedIcon} /> Remove Language
                </Button>
            </div>
        );
    }
}

const mapDispatchToProps = dispatch => bindActionCreators({ removeLanguage }, dispatch);

export default connect(
    null,
    mapDispatchToProps
)(withStyles(styles)(RemoveLanguage));
