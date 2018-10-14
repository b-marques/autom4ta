import * as actionType from "../actions/ActionType";
import Grammar from "../logic/Grammar";
import FA from "../logic/FA";
import RE from "../logic/RE";

const languageReducer = (state = 0, action) => {
    let newState = Object.assign({}, state);
    switch (action.type) {
        case actionType.ADD_LANGUAGE:
            newState.languages.push({
                name: action.name,
                grammar: new Grammar(),
                fa: new FA(new Set(), new Set(), [], "", new Set()),
                re: new RE()
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
            newState.languages[newState.selected_language].fa.updateTransition(action.state, action.to, action.symbol);
            return newState;

        case actionType.DETERMINIZE:
            let det_name =
                action.name !== "" ? action.name : "(id : " + newState.selected_language.toString() + " deterministic)";
            let det_dfa = newState.languages[newState.selected_language].fa.determinize();
            let det_grammar = new Grammar();
            det_grammar.buildFromDFA(det_dfa);
            newState.languages.push({
                name: det_name,
                grammar: det_grammar,
                fa: det_dfa,
                re: new RE()
            });
            newState.selected_language = newState.languages.length - 1;
            console.log(JSON.stringify(det_grammar));
            return newState;

        case actionType.MINIMIZE:
            let min_name = action.name !== "" ? action.name : newState.selected_language.toString() + " minimal";
            let min_dfa = newState.languages[newState.selected_language].fa.minimize();
            let min_grammar = new Grammar();
            min_grammar.buildFromDFA(min_dfa);
            newState.languages.push({
                name: min_name,
                grammar: min_grammar,
                fa: min_dfa,
                re: new RE()
            });
            newState.selected_language = newState.languages.length - 1;

            return newState;

        case actionType.UNION:
            let union_id = parseInt(action.id, 10);
            if (union_id < 0 || union_id > newState.languages.length - 1 || !Number.isInteger(union_id)) {
                return newState;
            }
            if (
                newState.languages[newState.selected_language].fa.determinized === true &&
                newState.languages[union_id].fa.determinized === true
            ) {
                let union_dfa = newState.languages[newState.selected_language].fa.union(
                    newState.languages[union_id].fa
                );
                let union_grammar = new Grammar();

                newState.languages.push({
                    name: "ID: " + newState.selected_language + " UNION  ID:" + union_id,
                    grammar: union_grammar,
                    fa: union_dfa,
                    re: new RE()
                });
                newState.selected_language = newState.languages.length - 1;
                return newState;
            }
            return newState;

        case actionType.INTERSECTION:
            let intersection_id = parseInt(action.id, 10);
            if (intersection_id < 0 || intersection_id > newState.languages.length - 1) {
                return newState;
            }
            if (
                newState.languages[newState.selected_language].fa.determinized === true &&
                newState.languages[intersection_id].fa.determinized === true
            ) {
                let intersection_dfa = newState.languages[newState.selected_language].fa.intersection(
                    newState.languages[intersection_id].fa
                );
                let intersection_grammar = new Grammar();
                intersection_grammar.buildFromDFA(intersection_dfa);

                newState.languages.push({
                    name: "ID:" + newState.selected_language + " INTERSECTION ID:" + intersection_id,
                    grammar: intersection_grammar,
                    fa: intersection_dfa,
                    re: new RE()
                });
                newState.selected_language = newState.languages.length - 1;
                return newState;
            }
            return newState;

        case actionType.UPDATE_RE:
            newState.languages[newState.selected_language].re = new RE(action.text);
            let re_dfa = newState.languages[newState.selected_language].re.buildDFA();
            newState.languages[newState.selected_language].fa = re_dfa === undefined ? new FA() : re_dfa;
            if (re_dfa !== undefined) {
                newState.languages[newState.selected_language].grammar.buildFromDFA(re_dfa);
            }

            return newState;

        case actionType.REMOVE_STATE:
            newState.languages[newState.selected_language].fa.deleteState(action.state);
            return newState;

        case actionType.REMOVE_SYMBOL:
            newState.languages[newState.selected_language].fa.deleteSymbol(action.symbol);
            return newState;

        default:
            return newState;
    }
};

export default languageReducer;
