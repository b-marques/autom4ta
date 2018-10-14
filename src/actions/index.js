import * as actionType from "./ActionType";

export const addLanguage = name => ({
    type: actionType.ADD_LANGUAGE,
    name: name
});

export const selectLanguage = id => ({
    type: actionType.SELECT_LANGUAGE,
    selected_id: id
});

export const removeLanguage = () => ({
    type: actionType.REMOVE_LANGUAGE
});

export const updateGrammar = text => ({
    type: actionType.UPDATE_GRAMMAR,
    text: text
});

export const addState = state => ({
    type: actionType.ADD_STATE,
    state: state
});

export const addSymbol = symbol => ({
    type: actionType.ADD_SYMBOL,
    symbol: symbol
});

export const setInitial = symbol => ({
    type: actionType.SET_INITIAL,
    symbol: symbol
});

export const addFinal = state => ({
    type: actionType.ADD_FINAL,
    state: state
});

export const removeFinal = state => ({
    type: actionType.REMOVE_FINAL,
    state: state
});

export const updateTransition = (state, to, symbol) => ({
    type: actionType.UPDATE_TRANSITION,
    state: state,
    to: to,
    symbol: symbol
});

export const determinize = name => ({
    type: actionType.DETERMINIZE,
    name: name
});

export const minimize = name => ({
    type: actionType.MINIMIZE,
    name: name
});

export const union = id => ({
    type: actionType.UNION,
    id: id
});

export const intersection = id => ({
    type: actionType.INTERSECTION,
    id: id
});

export const updateRE = text => ({
    type: actionType.UPDATE_RE,
    text: text
});

export const removeState = state => ({
    type: actionType.REMOVE_STATE,
    state: state
});

export const removeSymbol = symbol => ({
    type: actionType.REMOVE_SYMBOL,
    symbol: symbol
});
