import { combineReducers } from "redux";
import languageReducer from "./languageReducer";

const automataApp = combineReducers({
    languageReducer
});

export default automataApp;
