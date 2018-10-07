import React from "react";
import { connect } from "react-redux";
import { removeLanguage } from "../actions";
import { bindActionCreators } from "redux";

class RemoveLanguage extends React.Component {
    render() {
        return (
            <div
                className="rm-lang-container"
                style={{ display: "table-cell" }}
            >
                <button
                    className="button is-primary"
                    onClick={e => {
                        e.preventDefault();
                        this.props.removeLanguage();
                    }}
                >
                    Remove
                </button>
            </div>
        );
    }
}

const mapDispatchToProps = dispatch =>
    bindActionCreators({ removeLanguage }, dispatch);

export default connect(
    null,
    mapDispatchToProps
)(RemoveLanguage);
