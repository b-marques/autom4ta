import React from "react";
import LanguageList from "../containers/LanguageList";
import AddLanguage from "../containers/AddLanguage";
import RemoveLanguage from "../containers/RemoveLanguage";

const App = () => {
    return (
        <div className="container">
            <div>
                <LanguageList />
            </div>
            <br />
            <div>
                <AddLanguage />
                <RemoveLanguage />
            </div>
        </div>
    );
};
export default App;
