import React from "react";
import { connect } from "react-redux";
import { addLanguage } from "../actions";
import { bindActionCreators } from "redux";

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
        return (
            <div
                className="add-lang-container"
                style={{ display: "table-cell" }}
            >
                <input
                    type="text"
                    name="new-language-name"
                    value={this.state.inputValue}
                    onChange={this.updateInputValue}
                    placeholder="New Language Name"
                />
                <button
                    className="button is-primary"
                    onClick={e => {
                        e.preventDefault();
                        this.props.addLanguage(this.state.inputValue);
                    }}
                >
                    Add
                </button>
            </div>
        );
    }
}

const mapDispatchToProps = dispatch =>
    bindActionCreators({ addLanguage }, dispatch);

export default connect(
    null,
    mapDispatchToProps
)(AddLanguage);
