import * as actionType from "../actions/ActionType";
import Grammar from "../logic/Grammar";
import FA from "../logic/FA";

const languageReducer = (state = 0, action) => {
    let newState = Object.assign({}, state);
    switch (action.type) {
        case actionType.ADD_LANGUAGE:
            newState.languages.push({
                name: action.name,
                grammar: new Grammar(),
                fa: new FA(new Set(), new Set(), [], "", new Set()),
                er: "......"
            });
            newState.selected_language = newState.languages.length - 1;
            return newState;

        case actionType.SELECT_LANGUAGE:
            newState.selected_language = action.selected_id;
            return newState;

        case actionType.REMOVE_LANGUAGE:
            newState.languages.splice(newState.selected_language, 1);
            if (newState.selected_language === newState.languages.length)
                newState.selected_language = newState.languages.length - 1;
            return newState;

        case actionType.UPDATE_GRAMMAR:
            newState.languages[newState.selected_language].grammar = new Grammar(action.text, [], [], {}, null);
            newState.languages[newState.selected_language].grammar.extractElements();
            newState.languages[newState.selected_language].fa.buildFromGrammar(
                newState.languages[newState.selected_language].grammar
            );

            return newState;

        case actionType.ADD_STATE:
            newState.languages[newState.selected_language].fa.addState(action.state);
            return newState;

        case actionType.ADD_SYMBOL:
            newState.languages[newState.selected_language].fa.addSymbol(action.symbol);
            return newState;

        case actionType.SET_INITIAL:
            newState.languages[newState.selected_language].fa.setInitial(action.symbol);
            return newState;

        case actionType.ADD_FINAL:
            newState.languages[newState.selected_language].fa.addFinal(action.state);
            return newState;

        case actionType.REMOVE_FINAL:
            newState.languages[newState.selected_language].fa.removeFinal(action.state);
            return newState;

        case actionType.UPDATE_TRANSITION:
            newState.languages[newState.selected_language].fa.updateTransition(action.from, action.to, action.when);
            return newState;

        default:
            return newState;
    }
};

export default languageReducer;
